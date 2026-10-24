"use server";

import { ID } from "node-appwrite";

import { createSessionClient } from "@/lib/appwrite";
import { env } from "@/env";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

type UploadUrlResult =
  | { uploadUrl: string; fileId: string }
  | { error: string };

/**
 * Server action: validates the request, checks the session, and returns a
 * short-lived Appwrite upload endpoint + file ID.
 *
 * The client then POSTs directly to the Appwrite Storage REST endpoint with
 * the file and fileId, bypassing the app server for the actual bytes.
 */
export async function createUploadUrl(params: {
  fileName: string;
  contentType: string;
  fileSize: number;
}): Promise<UploadUrlResult> {
  // Validate
  if (!ALLOWED_TYPES.includes(params.contentType)) {
    return { error: "Unsupported file type" };
  }
  if (params.fileSize > MAX_FILE_SIZE) {
    return { error: "File too large (max 5 MB)" };
  }

  // Auth check
  try {
    await createSessionClient();
  } catch {
    return { error: "Unauthorized" };
  }

  const fileId = ID.unique();
  const bucketId = env.APPWRITE_BUCKET_ID;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT ?? "";

  // Direct REST endpoint for Appwrite Storage file creation
  const uploadUrl = `${endpoint}/storage/buckets/${bucketId}/files`;

  // Note: the client must include X-Appwrite-Project header and the session
  // cookie. We return the target URL + fileId; the client builds the FormData.
  return { uploadUrl: `${uploadUrl}?project=${projectId}`, fileId };
}
