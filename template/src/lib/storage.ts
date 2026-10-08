import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";

/**
 * S3 client pointed at Backblaze B2's S3-compatible endpoint.
 * `forcePathStyle` is required by B2.
 */
export const s3 = new S3Client({
  region: env.B2_REGION,
  endpoint: env.B2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APPLICATION_KEY,
  },
});

const PRESIGN_EXPIRES_IN_SECONDS = 60;

/**
 * Create a short-lived presigned PUT URL so a client can upload a file
 * directly to B2 without the bytes passing through the app server.
 *
 * The client MUST send the same `Content-Type` header it asked to sign,
 * otherwise the signature check fails.
 */
export async function createPresignedUploadUrl(
  params: Pick<PutObjectCommandInput, "Key" | "ContentType">,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.B2_BUCKET,
    Key: params.Key,
    ContentType: params.ContentType,
  });

  return getSignedUrl(s3, command, { expiresIn: PRESIGN_EXPIRES_IN_SECONDS });
}
