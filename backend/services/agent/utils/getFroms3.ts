import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.ts";

export const getFromS3 = async (
  filename: string,
  expiresIn: number = 60 * 5, // 5 minutes
) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: filename,
  });

  return getSignedUrl(s3, command, { expiresIn });
};
