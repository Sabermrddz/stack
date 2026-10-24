import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { createPresignedUploadUrl } from "@/lib/storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_CONTENT_TYPES, { message: "Unsupported file type" }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, { message: "File too large (max 5 MB)" }),
});

/**
 * POST /api/upload
 * Returns a short-lived presigned PUT URL for a direct browser-to-B2 upload.
 * Requires an active session.
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = uploadSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid upload request" },
      { status: 400 },
    );
  }

  const safeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${crypto.randomUUID()}-${safeName}`;

  const url = await createPresignedUploadUrl({
    Key: key,
    ContentType: parsed.data.contentType,
  });

  return Response.json({ url, key });
}
