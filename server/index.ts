import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
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
  console.log('New client connected');

  // Send initial status
  const initialMessage = {
    type: 'initialStatus',
    data: rooms
  };
  console.log('Sending initial status:', initialMessage);
  ws.send(JSON.stringify(initialMessage));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        console.log('Processing status update for room:', room, 'new status:', status);

        if (rooms[room]) {
          const newStatus = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
          rooms[room].status = newStatus;
          console.log(`Updated ${room} status to ${newStatus}`);

          // Create update message
          const updateMessage = {
            type: 'statusUpdated',
            room,
            status: newStatus
          };

          // Log before broadcasting
          console.log('Broadcasting to clients:', updateMessage);
          console.log('Number of connected clients:', wss.clients.size);

          // Broadcast to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(updateMessage));
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
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