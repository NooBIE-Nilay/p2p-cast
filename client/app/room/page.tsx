"use client";
import UserFeedPlayer from "@/components/UserFeedPlayer";
import { SocketContext } from "@/contexts/socketContext";
import { use, useContext } from "react";
import { useMediaRecorder } from "@/app/hooks/useMediaRecorder";
import { Button } from "@/components/ui/button";
export default function Room({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const socketContext = useContext(SocketContext);
  if (!socketContext) return <>Socket Not Initialized</>;
  const { stream } = socketContext;
  const [isRecording, setIsRecording] = useMediaRecorder(stream, roomId);

  if (!stream) return <>Stream Not Initialized</>;
  return (
    <div className="max-w-6xl mx-auto mt-10 flex justify-center items-center flex-col">
      {/* //TODO: The Video Stream Doesn't turn off when we go back to home page */}
      <UserFeedPlayer stream={stream} owner={true} variant="secondary" />
      <Button variant={"outline"}>Join Charcha</Button>
    </div>
  );
}
