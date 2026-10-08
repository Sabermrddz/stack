import { toNextJsHandler } from "better-auth/next-js";

import { arcjet } from "@/lib/arcjet";
import { getAuth } from "@/lib/auth";

const handler = async (request: Request) => {
  const decision = await arcjet.protect(request);

  if (decision.isDenied()) {
    const rateLimited = decision.reason.isRateLimit();
    return Response.json(
      { error: rateLimited ? "Too many requests" : "Forbidden" },
      { status: rateLimited ? 429 : 403 },
    );
  }

  return (await getAuth()).handler(request);
};

export const { GET, POST } = toNextJsHandler(handler);
