"use client";
import { useRouter } from "next/navigation";
import Peer from "peerjs";
import React, { createContext, useEffect, useReducer, useState } from "react";
import SocketIoClient, { Socket } from "socket.io-client";
import { v4 as UUIdv4 } from "uuid";
import { peerReducer, PeerState } from "./reducers/peerReducer";
import { addPeerAction, removePeerAction } from "./actions/peerAction";
import {
  PeerJsPort,
  PeerJsUrl,
  SocketIOPort,
  SocketIOUrl,
} from "@/configs/clientConfig";
import { useAuth } from "@clerk/nextjs";

const WSServerUrl = `http://${SocketIOUrl}:${SocketIOPort}`;
interface contextType {
  socket: Socket;
  user: Peer | undefined;
  stream: MediaStream | undefined;
  peers: PeerState;
  token: string;
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
  const authObj = useAuth();
  const [token, setToken] = useState("");
  const [user, setUser] = useState<Peer>();

  const [stream, setStream] = useState<MediaStream>();

  const [peers, dispatch] = useReducer(peerReducer, {});
  const fetchAuthToken = async () => {
    if (authObj.isLoaded) {
      authObj.getToken().then((value) => setToken(value || ""));
    }
  };
  const fetchUserFeed = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setStream(mediaStream);
    async function getConnectedDevices(type: string) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === type);
    }

    const videoCameras = await getConnectedDevices("videoinput");
    console.log("Cameras found:", videoCameras);
  };

  useEffect(() => {
    const userId = UUIdv4();
    const newPeer = new Peer(userId, {
      host: PeerJsUrl,
      port: Number(PeerJsPort),
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
    fetchAuthToken();
  }, [authObj]);
  useEffect(() => {
    if (!user || !stream) return;
    socket.on("user-joined", ({ peerId }: { peerId: string }) => {
      const call = user.call(peerId, stream);
      console.log("Calling Peer: ", peerId);
      call.on("stream", () => {
        dispatch(addPeerAction(peerId, call.remoteStream));
      });
    });
    socket.on("user-left", ({ peerId }: { peerId: string }) => {
      dispatch(removePeerAction(peerId));
    });
    user.on("call", (call) => {
      console.log("Receiving a call from", call);
      call.answer(stream);
      call.on("stream", () => {
        dispatch(addPeerAction(call.peer, call.remoteStream));
      });
    });
    socket.emit("ready");
  }, [user, stream]);

  return (
    <SocketContext.Provider value={{ socket, user, stream, peers, token }}>
      {children}
    </SocketContext.Provider>
  );
};
