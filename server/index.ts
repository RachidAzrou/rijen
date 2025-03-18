import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Store room statuses in memory with proper typing
type RoomStatus = 'OK' | 'NOK' | 'OFF';
interface RoomState {
  [key: string]: RoomStatus;
}

// In-memory status store
let roomStatuses: RoomState = {
  'prayer-ground': 'OFF',
  'prayer-first': 'OFF',
  'garage': 'OFF'
};

// Helper function to broadcast to all clients
function broadcast(message: any) {
  const messageStr = JSON.stringify(message);
  console.log('[WebSocket] Broadcasting:', message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Helper function to validate room and status
function isValidRoom(room: string): boolean {
  return ['prayer-ground', 'prayer-first', 'garage'].includes(room);
}

function isValidStatus(status: string): status is RoomStatus {
  return ['OK', 'NOK', 'OFF'].includes(status);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('[WebSocket] New client connected');

  // Send initial status immediately
  ws.send(JSON.stringify({
    type: 'initialStatus',
    data: roomStatuses
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[WebSocket] Received message:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;

        // Validate input
        if (!isValidRoom(room)) {
          console.error(`[WebSocket] Invalid room: ${room}`);
          return;
        }

        if (!isValidStatus(status)) {
          console.error(`[WebSocket] Invalid status: ${status}`);
          return;
        }

        // Update status in memory
        roomStatuses[room] = status;
        console.log(`[WebSocket] Updated ${room} status to ${status}`);

        // Broadcast update to all clients immediately
        broadcast({
          type: 'statusUpdated',
          room,
          status
        });
      } else if (data.type === 'getInitialStatus') {
        // Send current status to requesting client
        ws.send(JSON.stringify({
          type: 'initialStatus',
          data: roomStatuses
        }));
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Client error:', error);
  });
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// Catch-all route to serve index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT}`);
});