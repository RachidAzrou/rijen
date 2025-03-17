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
      console.log('Received message:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (rooms[room]) {
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
          console.log('Updated room:', room, 'to status:', rooms[room].status);

          // Send update to ALL clients
          const updateMessage = JSON.stringify({
            type: 'statusUpdated',
            room,
            status: rooms[room].status
          });

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(updateMessage);
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

// All routes serve index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});