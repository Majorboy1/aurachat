import { getRedis, getRedisPublisher, isRedisAvailable } from "./redis.js";

const ROOM_TTL_SECONDS = 60 * 60 * 24;
const roomUsers = new Map();
const roomMetaFallback = new Map();
const roomHistoryFallback = new Map();

function roomMetaKey(roomId) {
  return `room:${roomId}:meta`;
}

function roomHistoryKey(roomId) {
  return `room:${roomId}:history`;
}

function defaultRoomMeta() {
  return {
    currentPersona: "Default",
    currentModel: "gpt-4o",
  };
}

async function publishRoomEvent(roomId, type, payload) {
  const publisher = getRedisPublisher();
  if (publisher && isRedisAvailable()) {
    try {
      await publisher.publish(`room:${roomId}:events`, JSON.stringify({ type, payload }));
    } catch (error) {
      console.error("Unable to publish room event:", error.message);
    }
  }
}

export function addUserToRoom(roomId, user) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, []);
  }

  const existing = roomUsers.get(roomId);
  const deduped = existing.filter((item) => item.username !== user.username);
  deduped.push(user);
  roomUsers.set(roomId, deduped);
  return deduped;
}

export function removeUserFromRoom(roomId, username) {
  const nextUsers = (roomUsers.get(roomId) || []).filter((user) => user.username !== username);
  roomUsers.set(roomId, nextUsers);
  return nextUsers;
}

export function getUsersInRoom(roomId) {
  return roomUsers.get(roomId) || [];
}

export async function getRoomMeta(roomId) {
  const redis = getRedis();
  if (redis && isRedisAvailable()) {
    try {
      const raw = await redis.get(roomMetaKey(roomId));
      if (!raw) {
        await redis.set(roomMetaKey(roomId), JSON.stringify(defaultRoomMeta()), "EX", ROOM_TTL_SECONDS);
        return defaultRoomMeta();
      }
      return JSON.parse(raw);
    } catch (error) {
      console.error("Unable to load room meta from Redis:", error.message);
    }
  }

  if (!roomMetaFallback.has(roomId)) {
    roomMetaFallback.set(roomId, defaultRoomMeta());
  }
  return roomMetaFallback.get(roomId);
}

export async function setRoomMeta(roomId, updates) {
  const current = { ...(await getRoomMeta(roomId)), ...updates };
  const redis = getRedis();

  if (redis && isRedisAvailable()) {
    try {
      await redis.set(roomMetaKey(roomId), JSON.stringify(current), "EX", ROOM_TTL_SECONDS);
    } catch (error) {
      console.error("Unable to persist room meta:", error.message);
    }
  } else {
    roomMetaFallback.set(roomId, current);
  }

  await publishRoomEvent(roomId, "meta-updated", current);
  return current;
}

export async function getRoomHistory(roomId) {
  const redis = getRedis();
  if (redis && isRedisAvailable()) {
    try {
      const raw = await redis.get(roomHistoryKey(roomId));
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Unable to load room history from Redis:", error.message);
    }
  }

  return roomHistoryFallback.get(roomId) || [];
}

export async function saveRoomHistory(roomId, history) {
  const redis = getRedis();
  if (redis && isRedisAvailable()) {
    try {
      await redis.set(roomHistoryKey(roomId), JSON.stringify(history), "EX", ROOM_TTL_SECONDS);
      return;
    } catch (error) {
      console.error("Unable to save room history to Redis:", error.message);
    }
  }

  roomHistoryFallback.set(roomId, history);
}

export async function appendMessageToRoom(roomId, message) {
  const history = await getRoomHistory(roomId);
  history.push(message);
  await saveRoomHistory(roomId, history);
  await publishRoomEvent(roomId, "message-appended", message);
  return history;
}

export async function updateMessageReactions(roomId, messageId, emoji, username, action) {
  const history = await getRoomHistory(roomId);
  const nextHistory = history.map((message) => {
    if (message.id !== messageId) {
      return message;
    }

    const reactions = { ...(message.reactions || {}) };
    const users = new Set(reactions[emoji] || []);
    if (action === "add") {
      users.add(username);
    } else {
      users.delete(username);
    }
    reactions[emoji] = Array.from(users);
    return { ...message, reactions };
  });

  await saveRoomHistory(roomId, nextHistory);
  const updated = nextHistory.find((message) => message.id === messageId);
  await publishRoomEvent(roomId, "reaction-updated", { messageId, reactions: updated?.reactions || {} });
  return updated?.reactions || {};
}

export async function getOpenAIContext(roomId) {
  const history = await getRoomHistory(roomId);
  return history.slice(-40).map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content,
  }));
}

