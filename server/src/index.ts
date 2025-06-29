import { GetObjectCommand } from "@aws-sdk/client-s3";
import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";
import { verifyWebhook } from "@clerk/express/webhooks";
import cors from "cors";
import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { PORT } from "./config/serverConfig";
import { prisma } from "./db";
import { roomHandler } from "./handlers/roomHandler";
import s3Client from "./s3";

const app = express();
app.use(cors());
app.use(clerkMiddleware());

const server = http.createServer(app);

app.get("/health", (_, res) => {
  res.json({ message: "Server Running Successfully", status: "200" });
});
app.get("/api/auth_health", requireAuth(), (_, res) => {
  res.json({ message: "Server Running Successfully", status: "200" });
});
app.get("/", (_, res) => {
  res.json({ message: "Server Running Successfully", status: "200" });
});
app.post(
  "/api/merge-blobs",
  requireAuth(),
  express.json(),
  async (req, res) => {
    const { room_id, blobsLength, source } = req.body;
    const bucket = process.env.AWS_BUCKET;
    const { userId } = getAuth(req);
    if (!room_id || !blobsLength || !source || !userId) {
      res.status(400).json({ error: "Missing Params" });
      return;
    }
    const downloadDir = `/tmp/room/${room_id}`;
    const mergedKey = path.join(downloadDir, `${userId}.mp4`);
    try {
      fs.mkdirSync(downloadDir, { recursive: true });
      const inputListPath = path.join(downloadDir, "inputs.txt");
      const inputList = [];
      for (let index = 0; index < blobsLength; index++) {
        const key = `rooms/${room_id}/participants/${userId}/raw/${source}/video-${index}.webm`;
        const localPath = path.join(downloadDir, `video_${index}.webm`);
        try {
          const command = new GetObjectCommand({ Bucket: bucket, Key: key });
          const { Body } = await s3Client.send(command);
          if (!Body) {
            return;
          }
          const blob = new Blob([await Body.transformToByteArray()], {
            type: "video/webm",
          });
          const buffer = Buffer.from(await blob.arrayBuffer());
          fs.writeFileSync(localPath, buffer);
          console.log(`${localPath} Saved`);
        } catch (e) {
          console.log(e);
        }
        inputList.push(`file '${localPath}'`);
        console.log(inputList);
      }
      fs.writeFileSync(inputListPath, inputList.join("\n"));
      console.log(`Finished ${inputListPath}`);
      res.json({ success: true, outputKey: mergedKey });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  },
);
app.post(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const evt = await verifyWebhook(req);
      const { type, data, object } = evt;
      if (object !== "event") {
        throw new Error("Invalid object type");
      }
      if (data.object !== "user") {
        throw new Error("Invalid data object type");
      }
      if (type === "user.deleted") {
        try {
          const { id } = data;
          await prisma.user.delete({
            where: { id },
          });
        } catch (err) {
          console.error("Error deleting user with Id:", data.id);
        }
      } else if (type === "user.created" || type === "user.updated") {
        const user = {
          createdAt: new Date(data.created_at),
          email: JSON.stringify(
            data.email_addresses.find(
              (e) => e.id === data.primary_email_address_id,
            )?.email_address,
          ),
          id: data.id,
          name: data.first_name + " " + data.last_name,
          phoneNo: JSON.stringify(
            data.phone_numbers.find(
              (e) => e.id === data.primary_phone_number_id,
            )?.phone_number,
          ),
          updatedAt: new Date(data.updated_at),
        };
        if (type === "user.created") {
          try {
            await prisma.user.create({
              data: { ...user },
            });
          } catch (err) {
            console.error("Error creating user with id:", data.id);
          }
        } else if (type === "user.updated") {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { ...user },
            });
          } catch (err) {
            console.error("Error updating user with ID:", data.id);
          }
        } else {
          throw new Error("Invalid event type");
        }
        res.send("Webhook received");
      }
    } catch (err) {
      res.status(400).send("Error verifying webhook");
    }
  },
);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
io.on("connection", (socket) => {
  console.log(socket.id, " Connected");
  roomHandler(socket);
  socket.on("disconnect", () => {
    console.log(socket.id, " Disconnected");
  });
});

server.listen(PORT, () => console.log(`Server Started at Port: ${PORT}`));
