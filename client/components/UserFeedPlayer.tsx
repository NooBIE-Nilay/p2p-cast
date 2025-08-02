import React, { useContext, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronsUpDown,
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { PopoverContent } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { SocketContext } from "@/contexts/socketContext";
const UserFeedPlayer: React.FC<{
  stream?: MediaStream;
  owner?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}> = ({ stream, owner, variant = "primary", className }) => {
  const baseStyles = "flex flex-col items-center justify-center";
  const variantStyles = {
    primary: "",
    secondary: "",
  };
  const [audioTrack, setAudioTrack] = useState(true);
  const [videoTrack, setVideoTrack] = useState(true);
  const [screenTrack, setScreenTrack] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);
  const [audioPopupOpen, setAudioPopupOpen] = useState(false);
  const [value, setValue] = useState(localStorage.getItem("videoId") || "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const socketContext = useContext(SocketContext);
  if (!socketContext) return;
  const { switchStream } = socketContext;
  console.log((owner ? "Owner " : "") + "Stream Tracks:", stream?.getTracks());
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
  const mediaDevicesRef = useRef(navigator.mediaDevices);
  const fetchMediaDevices = () => {
    mediaDevicesRef.current.enumerateDevices().then((devices) => {
      setAudioDevices(devices.filter((device) => device.kind === "audioinput"));
      setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
    });
  };
  mediaDevicesRef.current.ondevicechange = fetchMediaDevices;
  useEffect(() => {
    fetchMediaDevices();
  }, [mediaDevicesRef]);
  useEffect(() => {
    switchStream(value, "videoinput");
  }, [value]);
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  if (!stream) return <div>Stream Not Initialized</div>;
  if (owner) {
    return (
      <div className={cn(baseStyles, variantStyles[variant], className)}>
        <div className=" rounded-[16px] flex items-center lg:w-[1000px] justify-between ">
          <video
            ref={videoRef}
            className="w-full h-full rounded-sm"
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
        <div className="flex justify-center items-center flex-col md:flex-row gap-2  md:gap-18 mt-4   ">
          <Popover open={videoPopupOpen} onOpenChange={setVideoPopupOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox">
                {videoDevices.find((device) => device.deviceId === value)
                  ?.label || videoDevices[0]?.label}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandList>
                  <CommandEmpty>No Video Sources found.</CommandEmpty>
                  <CommandGroup>
                    {videoDevices.map((device, index) => (
                      <CommandItem
                        key={`videoDevice${index}`}
                        value={device.deviceId}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setAudioPopupOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === device.deviceId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {device.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover open={audioPopupOpen} onOpenChange={setAudioPopupOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox">
                {audioDevices.find((device) => device.deviceId === value)
                  ?.label || audioDevices[0]?.label}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandList>
                  <CommandEmpty>No Audio Sources found.</CommandEmpty>
                  <CommandGroup>
                    {audioDevices.map((device, index) => (
                      <CommandItem
                        key={`audioDevices${index}`}
                        value={device.deviceId}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setAudioPopupOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === device.deviceId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {device.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
