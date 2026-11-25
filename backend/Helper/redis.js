import { createClient } from "redis"

export const redisClient = createClient({
  url: "redis://127.0.0.1:6379"
})

redisClient.on("error", (err) => {
  console.log("Redis Error:", err)
})

redisClient.on("connect", () => {
  console.log("Redis Client Connected")
})

export async function connectRedis() {
  await redisClient.connect()
}