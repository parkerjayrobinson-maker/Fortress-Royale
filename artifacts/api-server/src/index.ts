import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import app from "./app";
import { logger } from "./lib/logger";
import { attachMultiplayer } from "./multiplayer";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Serve the built frontend (when present) so the API server can host the SPA too.
const here = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(here, "../public");

app.use(express.static(staticDir, { index: "index.html", extensions: ["html"] }));
app.get(/^(?!\/(api|ws)).*/, (_req, res, next) => {
  res.sendFile(path.join(staticDir, "index.html"), (err) => {
    if (err) next();
  });
});

const server = createServer(app);
attachMultiplayer(server);

server.listen(port, () => {
  logger.info({ port }, "Server listening (HTTP + WebSocket on /ws)");
});
