import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AWS_LAMBDA_URL } from "@/configs/clientConfig";
import { openDB } from "idb";
import { useAuth } from "@clerk/nextjs";

const dbPromise = () =>
  openDB("media-blobs", 1, {
    upgrade(db) {
      db.createObjectStore("blobs");
    },
  });

async function storeBlobInIndexedDB(index: string, blob: Blob) {
  const db = await dbPromise();
  await db.put("blobs", blob, index);
}

async function getBlobFromIndexedDB(index: string): Promise<Blob> {
  const db = await dbPromise();
  return db.get("blobs", index);
}

async function deleteBlobFromIndexedDB(index: string) {
  const db = await dbPromise();
  db.delete("blobs", index);
}

const useMediaRecorder = (
  stream: MediaStream | undefined,
  roomId: string,
  interval: number = 5000
): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalId = useRef<NodeJS.Timeout>(null);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(isRecording);
  const uploadQueue: string[] = [];
  const indexRef = useRef(0);
  const { getToken } = useAuth();
  let isUploading = false;

  const mimeTypes = [
    "video/webm;codecs= h264",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  function enqueueForUpload(index: string) {
    uploadQueue.push(index);
    if (!isUploading) processUploadQueue();
  }
  async function uploadToS3(blob: Blob, index: string) {
    try {
      const token = await getToken();
      const signedUrlRes = await axios.get(
        `${AWS_LAMBDA_URL}/api/getSignedUrl`,
        {
          headers: {
            room_id: roomId,
            index: index,
            source: "camera",
            Authorization: token,
          },
        }
      );
      const signedUrl = signedUrlRes?.data?.url;
      if (!signedUrl) throw new Error("Signed URL is invalid");
      await axios.put(signedUrl, blob, {
        headers: {
          "Content-Type": blob.type || "video/webm",
        },
      });
      if (!isRecordingRef.current) {
        mergeBlobs(indexRef.current);
      }
      //UpdateDB with Etag and BlobIndex
    } catch (e) {
      console.log("Error Uploading Blob", e);
    }
  }
  async function mergeBlobs(blobsLength: number) {
    try {
      const token = await getToken();
      axios.post(
        "http://localhost:8080/api/merge-blobs",
        {
          blobsLength,
          room_id: roomId,
          source: "camera",
        },
        { headers: { Authorization: token } }
      );
    } catch (e) {
      console.log("Error Uploading Blob", e);
    }
  }
  async function processUploadQueue(): Promise<void> {
    isUploading = true;
    while (uploadQueue.length > 0) {
      const id = uploadQueue.shift();
      if (!id) continue;
      try {
        const blob = await getBlobFromIndexedDB(id);
        await uploadToS3(blob, id);
        await deleteBlobFromIndexedDB(id);
      } catch (err) {
        console.error(`Blob_${id} Failed, Added to Queue`);
        uploadQueue.push(id);
      }
    }
    isUploading = false;
  }
  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  useEffect(() => {
    const handleChunk = async (blob: Blob) => {
      if (blob.size > 0) {
        const index = indexRef.current;
        // downloadBlob(blob, `video_${index}`);
        await storeBlobInIndexedDB(index.toString(), blob);
        enqueueForUpload(index.toString());
        console.log(`test_${index} Saved`);
        indexRef.current++;
      }
    };
    let selectedMimeType = "";
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }
    if (!stream) return;
    const recorder = new MediaRecorder(stream, {
      mimeType: selectedMimeType,
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      handleChunk(event.data);
    };
    recorder.onstart = () => {
      console.log("Started");
    };
  }, [stream]);

  useEffect(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (isRecording) {
      isRecordingRef.current = true;
      if (recorder.state === "inactive") {
        recorder.start();
      }
      intervalId.current = setInterval(() => {
        recorder.stop();
        recorder.start();
      }, interval);
    } else {
      isRecordingRef.current = false;
      if (recorder.state === "recording") {
        recorder.stop();
      }
      //@ts-ignore
      clearInterval(intervalId.current);
    }
  }, [isRecording, interval, stream]);

  return [isRecording, setIsRecording];
};

export { useMediaRecorder };
