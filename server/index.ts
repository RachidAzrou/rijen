import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

type RoomStatus = 'green' | 'red' | 'grey';
type Room = {
  id: string;
  title: string;
  status: RoomStatus;
};

// Store room statuses
const rooms: Record<string, Room> = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
};

// Helper function to broadcast updates to all connected clients
const broadcastUpdate = (data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  // Send initial status to new client
  ws.send(JSON.stringify({ 
    type: 'initialStatus', 
    data: rooms 
  }));
  console.log('Sent initial status:', rooms);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (rooms[room]) {
          // Update room status
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';

          // Broadcast the update to all clients
          broadcastUpdate({
            type: 'statusUpdated',
            room,
            status: rooms[room].status
          });
        }
      } else if (data.type === 'getInitialStatus') {
        ws.send(JSON.stringify({ 
          type: 'initialStatus', 
          data: rooms 
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
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