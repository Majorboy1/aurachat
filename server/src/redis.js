import Redis from "ioredis";

let redis;
let redisSubscriber;
let redisPublisher;
let redisAvailable = true;

function markRedisUnavailable(error) {
  if (redisAvailable) {
    console.warn(`Redis unavailable, falling back to memory mode. ${error?.message || error}`);
  }
  redisAvailable = false;
}

function attachErrorHandlers(client) {
  client.on("error", markRedisUnavailable);
}

function resetRedisClients() {
  redis = undefined;
  redisPublisher = undefined;
  redisSubscriber = undefined;
}

async function closeClient(client) {
  if (!client) {
    return;
  }

  try {
    client.disconnect();
  } catch (error) {
    console.warn("Unable to close Redis client cleanly.", error?.message || error);
  }
}

export async function createRedisClients() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  redis = new Redis(redisUrl, {
    lazyConnect: true,
    connectTimeout: 1500,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  redisPublisher = new Redis(redisUrl, {
    lazyConnect: true,
    connectTimeout: 1500,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  redisSubscriber = new Redis(redisUrl, {
    lazyConnect: true,
    connectTimeout: 1500,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  [redis, redisPublisher, redisSubscriber].forEach(attachErrorHandlers);

  try {
    await Promise.all([redis.connect(), redisPublisher.connect(), redisSubscriber.connect()]);
    redisAvailable = true;
  } catch (error) {
    markRedisUnavailable(error);
    await Promise.all([closeClient(redis), closeClient(redisPublisher), closeClient(redisSubscriber)]);
    resetRedisClients();
  }

  return { redis, redisPublisher, redisSubscriber };
}

export function getRedis() {
  return redis;
}

export function getRedisPublisher() {
  return redisPublisher;
}

export function getRedisSubscriber() {
  return redisSubscriber;
}

export function isRedisAvailable() {
  return redisAvailable;
}
