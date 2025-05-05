import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { PORT } from "./config/serverConfig";
import { roomHandler } from "./handlers/roomHandler";
const app = express();
app.use(cors());
const server = http.createServer(app);

app.get("/", (_, res) => {
  res.json({ message: "Server Running Successfully", status: "200" });
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
