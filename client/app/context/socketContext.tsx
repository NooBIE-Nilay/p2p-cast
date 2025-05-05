"use client";
import { useRouter } from "next/navigation";
import React, { createContext, useEffect } from "react";
import SocketIoClient, { Socket } from "socket.io-client";

const WSServerUrl = "http://localhost:8080";

interface contextType {
  socket: Socket;
}
export const SocketContext = createContext<contextType | null>(null);
const socket = SocketIoClient(WSServerUrl, {
  withCredentials: false,
  transports: ["polling", "websocket"],
});

interface Props {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  useEffect(() => {
    const enterRoom = ({ roomId }: { roomId: string }) => {
      router.push(`/room/${roomId}`);
    };
    socket.on("room-created", enterRoom);
    return () => {
      socket.off("room-created", enterRoom);
    };
  }, [socket]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
