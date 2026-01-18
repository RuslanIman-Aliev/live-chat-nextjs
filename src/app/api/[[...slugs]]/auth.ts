import { redis } from "@/lib/redis";
import Elysia from "elysia";

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const authMiddleware = new Elysia({ name: "auth" })
  .error({ AuthError })
  .onError(({ code, set }) => {
    if (code === "AuthError") {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  })
  .derive({ as: "scoped" }, async ({ query, cookie }) => {
    const roomId = query.roomId as string;
    const authToken = cookie["x-auth-token"].value as string | undefined;
    if (!roomId || !authToken) {
      throw new AuthError("No auth token provided");
    }

    const connected = await redis.hget<string[]>(`meta:${roomId}`, "connected");

    if (!connected || !connected.includes(authToken)) {
      throw new AuthError("Invalid auth token");
    }

    return { auth: { roomId, authToken, connected } };
  });

export type AuthMiddleware = typeof authMiddleware;
