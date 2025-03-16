import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer, WebSocket } from 'ws';

console.log('Starting server initialization...');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Store room statuses with correct room IDs matching the client
const roomStatuses: { [key: string]: 'OK' | 'NOK' | 'OFF' } = {
  'prayer-ground': 'OFF',
  'prayer-first': 'OFF',
  'garage': 'OFF'
};

console.log('Initialized room statuses:', roomStatuses);

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

async function startServer(retries = 3, delay = 2000): Promise<void> {
  try {
    console.log('Starting server setup...');
    const server = await registerRoutes(app);

    // Set up WebSocket server
    const wss = new WebSocketServer({ server, path: '/ws' });
    console.log('WebSocket server initialized');

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

    // Add graceful shutdown handlers
    process.on('SIGINT', () => {
      console.log('Received SIGINT, closing server...');
      wss.close();
      server.close(() => {
        console.log('Server closed, exiting...');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, closing server...');
      wss.close();
      server.close(() => {
        console.log('Server closed, exiting...');
        process.exit(0);
      });
    });

    const port = process.env.PORT || 5000;
    console.log(`Attempting to start server on port ${port}...`);

    return new Promise((resolve, reject) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reuseAddr: true,
      }, () => {
        console.log(`Server started successfully, listening on port ${port}`);
        console.log('Current room statuses:', roomStatuses);
        resolve();
      }).on('error', async (error: any) => {
        if (error.code === 'EADDRINUSE' && retries > 0) {
          console.log(`Port ${port} is in use, waiting ${delay}ms before retry... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await startServer(retries - 1, delay);
        } else if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is still in use after all retries. Please ensure no other instance is running.`);
          process.exit(1);
        } else {
          console.error('Server failed to start:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

(async () => {
  try {
    await startServer();
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
})();