import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createRedisClients } from "./redis.js";
import { attachSocket } from "./socket.js";
import { doesRoomExist, getUsersInRoom } from "./rooms.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config({ path: path.join(serverRoot, ".env.local"), override: true });

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "AuraChat server" });
});

app.get("/api/rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const users = getUsersInRoom(roomId);
  res.json({
    roomId,
    exists: await doesRoomExist(roomId),
    userCount: users.length,
    users: users.map((user) => user.username),
  });
});

await createRedisClients();
attachSocket(server, clientOrigin);

server.listen(port, () => {
  console.log(`AuraChat server listening on http://localhost:${port}`);
});
