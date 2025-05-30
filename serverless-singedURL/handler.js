const serverless = require("serverless-http");
const express = require("express");
const app = express();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { clerkMiddleware, getAuth, requireAuth } = require("@clerk/express");
const cors = require("cors");
app.use(clerkMiddleware());
app.use(cors());
const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.MY_AWS_SECRET_KEY || "",
  },
});

app.get("/", (req, res, next) => {
  console.log("Hello Form  Handler anc");
  return res.status(200).json({
    message: "Hello from root!",
  });
});

const getPresignedPutUrl = async (fileName, contentType) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET || "",
    Key: fileName,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 120 });
  return url;
};

app.get("/api/getSignedUrl", requireAuth(), async (req, res) => {
  const { index, room_id, source } = req.headers;
  const user = getAuth(req);
  // Check if details provided in body verify the frontend schema
  // maybe directly fetch user_id and room_id from clerk Auth Object.
  try {
    const preSignedPutUrl = await getPresignedPutUrl(
      `rooms/${room_id}/participants/${user.userId}/raw/${source}/video-${index}.webm`,
      "video/webm"
    );
    return res.json({ status: "Success", url: preSignedPutUrl });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return res.status(500).json({ error: "Failed to generate signed URL" });
  }
});
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});
exports.handler = serverless(app);
