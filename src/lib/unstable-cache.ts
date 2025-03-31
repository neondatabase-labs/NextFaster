import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Custom unstable_cache implementation using Upstash Redis
export const unstable_cache = <Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  key: string[],
  options: { revalidate: number },
) => {
  return async (...args: Inputs) => {
    const cacheKey = JSON.stringify([...key, ...args]);
    // Try to get the cached value from Redis
    const cachedValue = await redis.get<Output>(cacheKey);
    if (cachedValue) return cachedValue;
    // If not found in cache, call the callback
    const result = await callback(...args);
    // Set the value in Redis with an expiration time
    await redis.set(cacheKey, result);
    await redis.expire(cacheKey, options.revalidate);
    return result;
  };
};
