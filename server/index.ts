import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Store room statuses
const rooms = {
  'first-floor': { id: 'first-floor', title: 'Moskee +1', status: 'grey' },
  'beneden': { id: 'beneden', title: 'Moskee +0', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
};

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  // Send initial status to new clients
  ws.send(JSON.stringify({ type: 'initialStatus', data: rooms }));
  console.log('Sent initial status:', rooms);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        console.log(`Processing status update for room ${room}: ${status}`);

        if (rooms[room]) {
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
          console.log(`Updated room ${room} status to ${rooms[room].status}`);

          // Broadcast the update to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              const updateMessage = JSON.stringify({
                type: 'statusUpdated',
                data: { room, status: rooms[room].status }
              });
              client.send(updateMessage);
              console.log('Broadcast status update:', updateMessage);
            }
          });
        } else {
          console.warn(`Received update for unknown room: ${room}`);
        }
      } else if (data.type === 'getInitialStatus') {
        console.log('Received request for initial status');
        ws.send(JSON.stringify({ type: 'initialStatus', data: rooms }));
        console.log('Sent initial status in response to request');
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Basic health check endpoint
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Simple API endpoint to test server functionality
app.get('/api/status', (_, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// Serve index.html for all other routes (SPA routing)
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});