import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import axios from "axios";

const useMediaRecorder = (
  stream: MediaStream | undefined,
  roomId: string,
  token: string,
  interval: number = 5000
): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const blobs: { blob: Blob; sent: boolean }[] = [];

  const handleChunk = (blob: Blob) => {
    blobs.push({ blob, sent: false });
    // TODO: Implement Queue to handle  getting a signed URL and
    blobs.forEach(async (obj, index) => {
      if (!obj.sent) {
        try {
          const signedUrlRes = await axios.get(
            `${process.env.AWS_SERVERLESS_URL}/api/getSignedUrl`,
            {
              headers: {
                room_id: roomId,
                index: index.toString(),
                source: "camera",
                Authorization: token,
              },
            }
          );
          const signedUrl = signedUrlRes?.data?.url;
          if (!signedUrl) throw new Error("Signed URL is invalid");
          axios
            .put(signedUrl, obj.blob, {
              headers: {
                "Content-Type": obj.blob.type || "video/webm",
              },
            })
            .then((res) => {
              if (res.status === 200) obj.sent = true;
              console.log(`Blob at index ${index} uploaded successfully`);
            });
        } catch (e) {
          console.log("Error Uploading Blob", e);
        }
      }
    });
  };

  useEffect(() => {
    if (!stream) return;
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) handleChunk(event.data);
    };

    recorder.onstop = () => {
      const video = new Blob(blobs.map((blobs) => blobs.blob));
      const url = URL.createObjectURL(video);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video_final.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    if (!isRecording) {
      recorder.stop();
    } else {
      recorder.start(interval);
    }
    return () => {
      recorder.stop();
    };
  }, [stream, isRecording]);
  return [isRecording, setIsRecording];
};
export { useMediaRecorder };
