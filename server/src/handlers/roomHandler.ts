import { Socket } from "socket.io";
import { v4 as UUIdv4 } from "uuid";
import IRoomParams from "../interfaces/IRoomParams";

// Rooms ->   Connected SocketIds & PeersIds

interface IRecordValue {
  peerId: string;
  socketId: string;
}
const rooms: Record<string, IRecordValue[]> = {};

export const roomHandler = (socket: Socket) => {
  const createRoom = () => {
    const roomId = UUIdv4();
    rooms[roomId] = [];
    socket.emit("room-created", { roomId });
  };

  const joinedRoom = ({ roomId, peerId }: IRoomParams) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].push({ peerId, socketId: socket.id });
      socket.on("ready", () => {
        socket.to(roomId).emit("user-joined", { peerId });
      });
      socket.on("disconnecting", () => {
        socket.to(roomId).emit("user-left", { peerId });
        rooms[roomId] = rooms[roomId].filter(
          (recordObj) => recordObj.socketId !== socket.id,
        );
      });
    }
  };

  socket.on("create-room", createRoom);
  socket.on("joined-room", joinedRoom);
};
