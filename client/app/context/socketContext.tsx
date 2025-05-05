"use client";
import { useRouter } from "next/navigation";
import Peer from "peerjs";
import React, { createContext, useEffect, useState } from "react";
import SocketIoClient, { Socket } from "socket.io-client";
import { v4 as UUIdv4 } from "uuid";

const WSServerUrl = "http://localhost:8080";

interface contextType {
  socket: Socket;
  user: Peer | undefined;
  stream: MediaStream | undefined;
}
export const SocketContext = createContext<contextType | null>(null);
const socket = SocketIoClient(WSServerUrl, {
  withCredentials: false,
  transports: ["polling", "websocket"],
});

interface ProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<ProviderProps> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();

  const fetchUserFeed = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setStream(mediaStream);
  };

  useEffect(() => {
    const userId = UUIdv4();
    const newPeer = new Peer(userId, {
      host: "localhost",
      port: 9000,
    });

    setUser(newPeer);
    fetchUserFeed();

    const enterRoom = ({ roomId }: { roomId: string }) => {
      router.push(`/room/${roomId}`);
    };

    socket.on("room-created", enterRoom);

    return () => {
      socket.off("room-created", enterRoom);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, user, stream }}>
      {children}
    </SocketContext.Provider>
  );
};
