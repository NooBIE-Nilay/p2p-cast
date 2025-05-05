"use client";

import { SocketContext } from "@/app/context/socketContext";
import { use, useContext, useEffect } from "react";

export default function Room({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const socketContext = useContext(SocketContext);
  if (!socketContext) return <>Socket Not Initialized</>;
  const { socket } = socketContext;
  useEffect(() => {
    socket.emit("join-room", { roomId }, (res: { status: "OK" | "Failed" }) => {
      if (res.status != "OK") return <>RoomID Can't be joined</>;
    });
  }, [roomId]);
  return <div>{roomId} Joined!</div>;
}
