import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.ts";

export const uploadFileToS3 = async (
  filename: string,
  fileBuffer: Buffer,
  contentType: string,
) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType,
    }),
  );

  return filename;
};
