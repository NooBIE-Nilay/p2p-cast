import { Socket } from "socket.io";
import { v4 as UUIdv4 } from "uuid";
import IRoomParams from "../interfaces/IRoomParams";

const rooms: Record<string, string[]> = {};

export const roomHandler = (socket: Socket) => {
  const createRoom = () => {
    const roomId = UUIdv4();
    rooms[roomId] = [];
    socket.emit("room-created", { roomId });
  };

  const joinedRoom = ({ roomId, peerId }: IRoomParams) => {
    if (rooms[roomId]) {
      console.log("New User Joined Room", roomId, "With PeerId:", peerId);
      rooms[roomId].push(peerId);
      socket.join(roomId);
      socket.on("ready", () => {
        socket.to(roomId).emit("user-joined", { peerId });
      });
    }
  };

  socket.on("create-room", createRoom);
  socket.on("joined-room", joinedRoom);
};
