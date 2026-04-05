import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import { createRedisClients } from "./redis.js";
import { attachSocket } from "./socket.js";

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

await createRedisClients();
attachSocket(server, clientOrigin);

server.listen(port, () => {
  console.log(`AuraChat server listening on http://localhost:${port}`);
});
