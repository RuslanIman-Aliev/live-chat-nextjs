import { redis } from "@/lib/redis";
import { Elysia } from "elysia";
import { nanoid } from "nanoid";

const rooms = new Elysia({ prefix: "/room" }).post("/create", async() => {
  const roomId = nanoid();

  await redis.hset(`meta:${roomId}`, {
    connected:[],
    createdAt:Date.now()
  })

  await redis.expire(`meta:${roomId}`, 60 * 10) 

  return { roomId };
});

const app = new Elysia({ prefix: "/api" }).use(rooms);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
