import { createClient } from "redis";

export const client = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  },
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

(async () => {
  await client.connect();
})();

export const cache = {
  async set(key, value, ttl = 3600) {
    try {
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error("Redis set error:", error);
    }
  },
  async get(key) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  },
  async del(key) {
    try {
      await client.del(key);
    } catch (error) {
      console.error("Redis del error:", error);
    }
  },
  async delPattern(pattern) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      console.error("Redis delPattern error:", error);
    }
  },
  async invalidateAnalyticsCache(userId) {
    const pattern = `analytics:${userId}:*`;
    await this.delPattern(pattern);
  },
  async invalidateCategoryCache() {
    await this.del("categories");
  },
};
