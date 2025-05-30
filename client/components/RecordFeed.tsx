import { useEffect, useRef, useState } from "react";

const RecordFeed: React.FC<{ stream?: MediaStream }> = ({ stream }) => {
  const [url, setURL] = useState("");
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const ARef = useRef<HTMLAnchorElement>(null);
  const [intervalId, setIntervalId] = useState<number>(0);
  useEffect(() => {
    if (!stream) return;
    const options = { mimeType: "video/webm; codecs=vp9" };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    let temp = setInterval((event) => {
      console.log("stopping");
      download();
      mediaRecorder.stop();
      if (ARef.current) ARef.current.click();
    }, 9000);
    setIntervalId((prev) => {
      clearInterval(prev);
      return temp;
    });
    function handleDataAvailable(event: BlobEvent) {
      console.log("data-available");
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
        console.log(recordedChunks);
      }
    }
  }, [stream]);
  function download() {
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    console.log(blob);
    const url = URL.createObjectURL(blob);
    setURL(url);
  }
  return (
    <>
      <a
        ref={ARef}
        href={url}
        download={"test.webm"}
        className="bg-slate-700 m-5 p-2 rounded"
      >
        {url}
      </a>
      <button
        className="bg-slate-700 p-1 m-3 hover:bg-slate-700/80 rounded"
        onClick={() => {
          clearInterval(intervalId);
          console.log(intervalId, "cleared");
        }}
      >
        Stop
      </button>
    </>
  );
};
export default RecordFeed;
