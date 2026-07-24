import { auth } from "@repo/auth";
import cors from "@fastify/cors";
import { fromNodeHeaders } from "better-auth/node";
import Fastify from "fastify";
import { env } from "./env.mjs";

const app = Fastify({ logger: true });

app.decorateRequest("session", null);

await app.register(cors, {
  origin: env.CORS_ORIGIN.split(","),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
});

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = fromNodeHeaders(request.headers);
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error({ err: error }, "Authentication error");
      return reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE"
      });
    }
  }
});

app.get("/health", async () => ({ status: "ok" }));

try {
  await app.listen({ port: 4000, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
