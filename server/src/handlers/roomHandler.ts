import { Socket } from "socket.io";
import { v4 as UUIdv4 } from "uuid";

export const roomHandler = (socket: Socket) => {
  const createRoom = () => {
    const roomId = UUIdv4();
    socket.emit("room-created", { roomId });
  };
  const joinRoom = (
    roomId: string,
    callback: (response: { status: string }) => void,
  ) => {
    socket.join(roomId);
    socket.emit("room-joined", { roomId });
    callback({ status: "OK" });
  };

  socket.on("create-room", createRoom);
  socket.on("join-room", joinRoom);
};
