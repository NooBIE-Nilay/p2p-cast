"use client";
import UserFeedPlayer from "@/components/UserFeedPlayer";
import { SocketContext } from "@/contexts/socketContext";
import { use, useContext, useEffect } from "react";

export default function Room({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const socketContext = useContext(SocketContext);
  if (!socketContext) return <>Socket Not Initialized</>;
  const { socket, user, stream, peers } = socketContext;
  useEffect(() => {
    if (user) socket.emit("joined-room", { roomId, peerId: user.id });
    console.log("Peers:", peers);
  }, [roomId, user]);
  return (
    <div>
      {user?.id} Joined!
      <div>
        User Feed:
        <UserFeedPlayer stream={stream} owner={true} />
        <p>Peer: {user?.id}</p>
        <p>Stream: {stream?.id}</p>
      </div>
      <div>
        Other User Feeds:
        <div>
          {Object.keys(peers).map((peerId: string) => (
            <div key={`peer_div_${peerId}`}>
              <UserFeedPlayer stream={peers[peerId].stream} />
              <p>Peer: {peerId}</p>
              <p>Stream: {peers[peerId].stream.id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
