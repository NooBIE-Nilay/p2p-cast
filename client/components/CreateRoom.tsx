"use client";
import { useContext } from "react";
import { SocketContext } from "@/contexts/socketContext";

export const CreateRoom: React.FC = () => {
  const socketContext = useContext(SocketContext);
  if (!socketContext) return <div>Loading</div>;
  const { socket } = socketContext;
  const initRoom = () => {
    socket.emit("create-room");
  };
  return (
    <button
      className="bg-slate-700 p-2 rounded hover:bg-slate-700/80"
      onClick={initRoom}
    >
      New Room
    </button>
  );
};
