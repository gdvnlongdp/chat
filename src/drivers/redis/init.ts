import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: process.env.CACHE_HOST as string,
    port: parseInt(process.env.CACHE_PORT as string),
  },
});

export default redisClient;
