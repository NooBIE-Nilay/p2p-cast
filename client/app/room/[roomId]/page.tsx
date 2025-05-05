"use client";

import UserFeedPlayer from "@/app/components/UserFeedPlayer";
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
  const { socket, user, stream } = socketContext;
  useEffect(() => {
    if (user) socket.emit("join-room", { roomId, peerId: user.id });
  }, [roomId, user]);
  return (
    <div>
      {roomId} Joined!
      <div>
        User Feed:
        <UserFeedPlayer stream={stream} />
      </div>
    </div>
  );
}
