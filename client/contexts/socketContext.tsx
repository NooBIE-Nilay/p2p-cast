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

const WSServerUrl = `http://${SocketIOUrl}:${SocketIOPort}`;
interface contextType {
  socket: Socket;
  user: Peer | undefined;
  stream: MediaStream | undefined;
  peers: PeerState;
  switchStream: (
    deviceId: string,
    kind: "videoinput" | "audioinput"
  ) => Promise<void>;
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

  async function switchStream(
    deviceId: string,
    kind: "videoinput" | "audioinput"
  ) {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: kind === "videoinput" ? { deviceId } : false,
        audio: kind === "audioinput" ? { deviceId } : false,
      });
      //TODO: This Somewhat Works, But Needs To Get Better
      if (stream && newStream) {
        stream.removeTrack(stream.getVideoTracks()[0]);
        stream.getAudioTracks()[0].stop();
        stream.addTrack(newStream.getVideoTracks()[0]);
      }
      localStorage.setItem("videoId", deviceId);
      // setStream(newStream);
    } catch (e) {
      console.error("Error Switching Stream");
      return;
    }
  }
  const fetchUserFeed = async () => {
    const videoId = localStorage.getItem("videoId");
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: videoId ? { deviceId: videoId } : true,
      audio: true,
    });
    setStream(mediaStream);
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
    <SocketContext.Provider
      value={{ socket, user, stream, peers, switchStream }}
    >
      {children}
    </SocketContext.Provider>
  );
};
