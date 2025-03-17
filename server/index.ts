import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";

console.log('Starting server initialization...');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Store room statuses
const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
};

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Send initial status to new clients
  ws.send(JSON.stringify({ type: 'initialStatus', data: rooms }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (rooms[room]) {
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';

          // Broadcast the update to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify({
                type: 'statusUpdated',
                data: { room, status: rooms[room].status }
              }));
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
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

const port = process.env.PORT || 5000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server started successfully on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
  console.log(`Status endpoint available at: http://localhost:${port}/api/status`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});