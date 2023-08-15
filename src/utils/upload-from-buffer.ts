import cloud from "cloudinary";
import express from "express";
import streamifier from "streamifier";
import cloudinary from "../drivers/couldinary";

// Upload file dạng Buffer lên cloud thông qua streamifier
function uploadFromBuffer(
  req: express.Request,
  options: cloud.UploadApiOptions
): Promise<cloud.UploadApiResponse> {
  return new Promise((resolve, rejects) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) {
        return rejects(err);
      }
      if (result) {
        return resolve(result);
      }
    });
    streamifier.createReadStream(req.file?.buffer as Buffer).pipe(stream);
  });
}

export default uploadFromBuffer;
