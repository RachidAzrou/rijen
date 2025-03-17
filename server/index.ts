import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer, WebSocket } from 'ws';

console.log('Starting server initialization...', new Date().toISOString());

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

async function startServer(): Promise<void> {
  try {
    const startTime = Date.now();
    console.log('Starting server setup...', new Date().toISOString());

    const server = await registerRoutes(app);
    console.log('Routes registered in', Date.now() - startTime, 'ms');

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
      ws.send(initialStatusMessage);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received message:', data);

          if (data.type === 'getInitialStatus') {
            ws.send(JSON.stringify({
              type: 'initialStatus',
              data: roomStatuses
            }));
          } else if (data.type === 'updateStatus') {
            const { room, status } = data;
            if (room && status && roomStatuses.hasOwnProperty(room)) {
              roomStatuses[room] = status;
              broadcast(JSON.stringify({
                type: 'statusUpdated',
                room,
                status
              }));
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
    });

    const port = process.env.PORT || 5000;
    console.log(`Starting server on port ${port}...`, new Date().toISOString());

    return new Promise((resolve, reject) => {
      let retries = 3;
      const tryListen = () => {
        console.log(`Attempt ${4 - retries} to start server on port ${port}`);

        server.listen(port, "0.0.0.0")
          .once('listening', () => {
            console.log(`Server started successfully on port ${port} in ${Date.now() - startTime}ms`);
            console.log('Current room statuses:', roomStatuses);
            resolve();
          })
          .once('error', (err: any) => {
            if (err.code === 'EADDRINUSE' && retries > 0) {
              console.log(`Port ${port} in use, retrying in 1 second... (${retries} retries left)`);
              retries--;
              setTimeout(tryListen, 1000);
            } else {
              console.error('Server failed to start:', err);
              reject(err);
            }
          });
      };

      tryListen();
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exit(1);
});