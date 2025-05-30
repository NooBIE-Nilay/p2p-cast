import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from "lucide-react";
const UserFeedPlayer: React.FC<{
  stream?: MediaStream;
  owner?: boolean;
}> = ({ stream, owner }) => {
  const [audioTrack, setAudioTrack] = useState(true);
  const [videoTrack, setVideoTrack] = useState(true);
  const [screenTrack, setScreenTrack] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    if (screenVideoRef.current && stream && stream.getVideoTracks()[1]) {
      const screenStream = new MediaStream();
      screenStream.addTrack(stream.getVideoTracks()[1]);
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [stream, screenTrack]);
  if (!stream) return;
  if (owner) {
    return (
      <div className=" flex flex-col items-center justify-center">
        <div className="flex items-center justify-between gap-10">
          <video
            ref={videoRef}
            className="w[300px] h-[200px]"
            muted={true}
            autoPlay
          />
          {screenTrack && stream.getVideoTracks()[1] && (
            <video
              className="w[300px] h-[200px]"
              muted={true}
              autoPlay
              ref={screenVideoRef}
            ></video>
          )}
        </div>
        <div className="flex justify-center items-center">
          <button
            className={"p-2 rounded m-3  bg-slate-700/60"}
            onClick={async () => {
              stream.getAudioTracks()[0].enabled = !audioTrack;
              setAudioTrack((state) => !state);
            }}
          >
            {audioTrack ? <Mic /> : <MicOff />}
          </button>
          <button
            className={"p-2 rounded m-3  bg-slate-700/60"}
            onClick={async () => {
              stream.getVideoTracks()[0].enabled = !videoTrack;
              setVideoTrack((state) => !state);
            }}
          >
            {videoTrack ? <Video /> : <VideoOff />}
          </button>
          <button
            className={"p-2 rounded m-3  bg-slate-700/60"}
            onClick={async () => {
              if (!screenTrack) {
                const screenTrackSrc = navigator.mediaDevices.getDisplayMedia({
                  video: true,
                });
                stream.addTrack((await screenTrackSrc).getVideoTracks()[0]);
              } else {
                stream.getVideoTracks()[1].enabled = false;
              }
              setScreenTrack((state) => !state);
            }}
          >
            {screenTrack ? <ScreenShareOff /> : <ScreenShare />}
          </button>
        </div>
      </div>
    );
  } else
    return (
      <div className="flex items-center justify-between gap-10">
        <video
          ref={videoRef}
          className="w[300px] h-[200px]"
          muted={true}
          autoPlay
        />
        {stream.getVideoTracks()[1] && (
          <video
            className="w[300px] h-[200px]"
            muted={true}
            autoPlay
            ref={screenVideoRef}
          ></video>
        )}
      </div>
    );
};
export default UserFeedPlayer;
