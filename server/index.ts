import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Store room statuses with correct room IDs matching the client
const roomStatuses: { [key: string]: 'OK' | 'NOK' | 'OFF' } = {
  'prayer-ground': 'OFF',
  'prayer-first': 'OFF',
  'garage': 'OFF'
};

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Broadcast to all clients
  function broadcast(message: string) {
    console.log('Broadcasting message:', message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send initial status on connection
    const initialStatusMessage = JSON.stringify({
      type: 'initialStatus',
      data: roomStatuses
    });
    console.log('Sending initial status:', initialStatusMessage);
    ws.send(initialStatusMessage);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        if (data.type === 'getInitialStatus') {
          const response = JSON.stringify({
            type: 'initialStatus',
            data: roomStatuses
          });
          console.log('Sending initial status response:', response);
          ws.send(response);
        } else if (data.type === 'updateStatus') {
          const { room, status } = data;
          if (room && status && roomStatuses.hasOwnProperty(room)) {
            console.log(`Updating status for room ${room} to ${status}`);
            roomStatuses[room] = status;
            // Broadcast the update to all clients
            const updateMessage = JSON.stringify({
              type: 'statusUpdated',
              room,
              status
            });
            console.log('Broadcasting status update:', updateMessage);
            broadcast(updateMessage);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();