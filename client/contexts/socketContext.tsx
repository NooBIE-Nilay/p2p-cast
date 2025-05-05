"use client";
import { useRouter } from "next/navigation";
import Peer from "peerjs";
import React, { createContext, useEffect, useReducer, useState } from "react";
import SocketIoClient, { Socket } from "socket.io-client";
import { v4 as UUIdv4 } from "uuid";
import { peerReducer, PeerState } from "./reducers/peerReducer";
import { addPeerAction } from "./actions/peerAction";

const WSServerUrl = "http://localhost:8080";

interface contextType {
  socket: Socket;
  user: Peer | undefined;
  stream: MediaStream | undefined;
  peers: PeerState;
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

  const [peers, dispatch] = useReducer(peerReducer, {});

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

    socket.emit("ready");

    return () => {
      socket.off("room-created", enterRoom);
    };
  }, [socket]);
  useEffect(() => {
    if (!user || !stream) return;
    socket.on("user-joined", ({ peerId }: { peerId: string }) => {
      const call = user.call(peerId, stream);
      console.log("Calling Peer: ", peerId);
      call.on("stream", () => {
        dispatch(addPeerAction(peerId, stream));
      });
    });
    user.on("call", (call) => {
      console.log("Receiving a call from", call);
      call.answer(stream);
      call.on("stream", () => {
        dispatch(addPeerAction(call.peer, stream));
      });
    });
    socket.emit("ready");
  }, [user, stream]);

  return (
    <SocketContext.Provider value={{ socket, user, stream, peers }}>
      {children}
    </SocketContext.Provider>
  );
};
