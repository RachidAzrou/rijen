import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Store room statuses
const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
};

// Broadcast helper function
const broadcast = (message: any) => {
  const messageStr = JSON.stringify(message);
  console.log('[WebSocket] Broadcasting:', messageStr);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');

  // Send initial status immediately on connection
  ws.send(JSON.stringify({
    type: 'initialStatus',
    data: rooms
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[WebSocket] Received:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (rooms[room]) {
          // Update room status
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';

          // Broadcast to all clients immediately
          broadcast({
            type: 'statusUpdated',
            room,
            status: rooms[room].status
          });
        }
      } else if (data.type === 'getInitialStatus') {
        // Send current status to requesting client
        ws.send(JSON.stringify({
          type: 'initialStatus',
          data: rooms
        }));
      }
    } catch (error) {
      console.error('[WebSocket] Error:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Client error:', error);
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// Health check endpoint
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Serve index.html for all routes
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});