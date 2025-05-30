import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";
import { verifyWebhook } from "@clerk/express/webhooks";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { PORT } from "./config/serverConfig";
import { prisma } from "./db";
import { roomHandler } from "./handlers/roomHandler";
import s3Client from "./s3";
const app = express();
app.use(cors());
app.use(clerkMiddleware());

const server = http.createServer(app);

const getPresignedPutUrl = async (fileName: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET || "",
    Key: fileName,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 120 });
  return url;
};
app.get("/health", (_, res) => {
  res.json({ message: "Server Running Successfully", status: "200" });
});
app.get("/", (_, res) => {
  res.json({ message: "Server Running Successfully", status: "200" });
});

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

app.get(
  "/api/getSignedUrl",
  express.json(),
  // requireAuth(),
  async (req, res) => {
    const { index, room_id, source } = req.headers;
    const user = getAuth(req);
    // Check if details provided in body verify the frontend schema
    // maybe directly fetch user_id and room_id from clerk Auth Object.
    try {
      const preSignedPutUrl = await getPresignedPutUrl(
        `rooms/${room_id}/participants/${user.userId}/raw/${source}/video-${index}.webm`,
        "video/webm",
      );
      res.json({ status: "Success", url: preSignedPutUrl });
    } catch (err) {
      console.error("Error generating signed URL:", err);
      res.status(500).json({ error: "Failed to generate signed URL" });
    }
  },
);

app.get("/api/testAuth", requireAuth(), (req, res) => {
  const obj = getAuth(req);
  console.log(obj);
  res.json({ obj });
});
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
