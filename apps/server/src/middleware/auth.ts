import { auth, type Session } from "@repo/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    session: Session | null;
  }
}

/**
 * preHandler that rejects unauthenticated requests and attaches the
 * session to the request for downstream handlers.
 *
 *   app.get("/api/thing", { preHandler: requireAuth }, async (request) => {
 *     request.session.user // authenticated user
 *   });
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  request.session = session;
}
