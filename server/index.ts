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
} as const;

// WebSocket server
wss.on('connection', (ws) => {
  console.log(`Connected client. Total clients: ${wss.clients.size}`);

  // Send initial status
  ws.send(JSON.stringify({
    type: 'initialStatus',
    data: rooms
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;

        if (rooms[room]) {
          // Update status
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';

          // Create update message
          const updateMsg = {
            type: 'statusUpdated',
            room,
            status: rooms[room].status
          };

          // Send to ALL clients
          console.log(`Broadcasting update to ${wss.clients.size} clients:`, updateMsg);
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(updateMsg));
            }
          });
        }
      }
    } catch (error) {
      console.error('Message processing error:', error);
    }
  });

  ws.on('error', console.error);
  ws.on('close', () => console.log(`Disconnected client. Remaining: ${wss.clients.size}`));
});

// Static files
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// All routes -> index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready at ws://localhost:${PORT}/ws`);
});