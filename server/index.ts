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

function broadcast(data: any) {
  const message = JSON.stringify(data);
  console.log('[WebSocket] Broadcasting to all clients:', message);

  let clientCount = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      clientCount++;
    }
  });
  console.log(`[WebSocket] Broadcast sent to ${clientCount} clients`);
}

wss.on('connection', (ws) => {
  console.log('[WebSocket] New client connected');
  console.log(`[WebSocket] Total connected clients: ${wss.clients.size}`);

  // Send initial status to new client
  const initialStatus = JSON.stringify({
    type: 'initialStatus',
    data: rooms
  });
  console.log('[WebSocket] Sending initial status to new client:', initialStatus);
  ws.send(initialStatus);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[WebSocket] Received message:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (rooms[room]) {
          const newStatus = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
          rooms[room].status = newStatus;
          console.log(`[WebSocket] Updated status for room ${room} to ${newStatus}`);

          // Broadcast the update to all clients
          const updateMessage = {
            type: 'statusUpdated',
            room,
            status: newStatus
          };
          broadcast(updateMessage);
        }
      } else if (data.type === 'getInitialStatus') {
        console.log('[WebSocket] Client requested initial status');
        ws.send(JSON.stringify({
          type: 'initialStatus',
          data: rooms
        }));
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    console.log(`[WebSocket] Remaining connected clients: ${wss.clients.size}`);
  });
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// Health check endpoint
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Handle all routes
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});