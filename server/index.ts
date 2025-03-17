import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
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

async function startServer(): Promise<void> {
  try {
    const server = await registerRoutes(app);

    // Set up WebSocket server
    const wss = new WebSocketServer({ server, path: '/ws' });

    // Broadcast to all clients
    function broadcast(message: string) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

    wss.on('connection', (ws) => {
      // Send initial status on connection
      ws.send(JSON.stringify({
        type: 'initialStatus',
        data: roomStatuses
      }));

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());

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

    const port = 8080;
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server started on port ${port}`);
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