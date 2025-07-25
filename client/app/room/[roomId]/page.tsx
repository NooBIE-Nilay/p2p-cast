"use client";
import UserFeedPlayer from "@/components/UserFeedPlayer";
import { SocketContext, SocketProvider } from "@/contexts/socketContext";
import { use, useContext, useEffect } from "react";
import { useMediaRecorder } from "@/app/hooks/useMediaRecorder";
export default function Room({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const socketContext = useContext(SocketContext);
  if (!socketContext) return <>Socket Not Initialized</>;
  const { socket, user, peers, stream } = socketContext;
  const [isRecording, setIsRecording] = useMediaRecorder(stream, roomId);

  useEffect(() => {
    if (user) socket.emit("joined-room", { roomId, peerId: user.id });
  }, [roomId, user]);

  if (!stream) return <>Stream Not Initialized</>;
  return (
    <div>
      <div>
        User Feed:
        <UserFeedPlayer stream={stream} owner={true} />
        <button
          className="bg-slate-700 p-2 m-2 hover:bg-slate-700/80"
          onClick={() => setIsRecording((prev: boolean) => !prev)}
        >
          {isRecording ? "Recording..." : "Not Recording"}
        </button>
      </div>
      <div>
        Other User Feeds:
        <div>
          {Object.keys(peers).map((peerId: string) => (
            <div key={`peer_div_${peerId}`}>
              <UserFeedPlayer stream={peers[peerId].stream} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
