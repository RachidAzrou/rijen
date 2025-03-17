import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Store room statuses
const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial status
  ws.send(JSON.stringify({
    type: 'initialStatus',
    data: rooms
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'updateStatus') {
        const { room, status } = data;

        if (rooms[room]) {
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';

          // Broadcast to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'statusUpdated',
                room,
                status: rooms[room].status
              }));
            }
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// All routes -> index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});