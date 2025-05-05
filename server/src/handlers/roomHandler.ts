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

  const joinRoom = ({ roomId, peerId }: IRoomParams) => {
    if (rooms[roomId]) {
      rooms[roomId].push(peerId);
      socket.join(roomId);
      console.log(rooms);
    }
  };
  socket.on("create-room", createRoom);
  socket.on("join-room", joinRoom);
};
