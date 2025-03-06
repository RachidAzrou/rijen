import express, { type Request, Response, NextFunction } from "express";
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Store room statuses
const roomStatuses: { [key: string]: 'OK' | 'NOK' | 'OFF' } = {
  'first-floor': 'OFF',
  'beneden': 'OFF',
  'garage': 'OFF'
};

// Add healthcheck endpoint for Render
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Create HTTP server
const server = app.listen({
  port: process.env.PORT || 5000,
  host: "0.0.0.0",
}, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

// Set up WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws',
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024
  }
});

// Broadcast to all clients
function broadcast(message: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial status on connection
  ws.send(JSON.stringify({
    type: 'initialStatus',
    data: roomStatuses
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      if (data.type === 'getInitialStatus') {
        ws.send(JSON.stringify({
          type: 'initialStatus',
          data: roomStatuses
        }));
      } else if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (room && status && roomStatuses.hasOwnProperty(room)) {
          roomStatuses[room] = status;
          // Broadcast the update to all clients
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

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});