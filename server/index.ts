import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Store room statuses
const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial status to new client
  socket.emit("initialStatus", rooms);
  console.log(`[Socket.IO] Sent initial status to client: ${socket.id}`);

  // Handle status updates
  socket.on("updateStatus", (data) => {
    try {
      const { room, status } = data;
      console.log(`[Socket.IO] Received status update:`, { room, status, clientId: socket.id });

      if (rooms[room]) {
        rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';

        // Broadcast the update to all clients
        const updateData = {
          room,
          status: rooms[room].status
        };

        io.emit("statusUpdated", updateData);
        console.log(`[Socket.IO] Broadcasted status update to all clients:`, updateData);
      }
    } catch (error) {
      console.error(`[Socket.IO] Error processing status update:`, error);
      socket.emit("error", "Failed to process status update");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`[Socket.IO] Socket error for client ${socket.id}:`, error);
  });
});

// Log total connected clients every 30 seconds
setInterval(() => {
  const connectedSockets = io.sockets.sockets.size;
  console.log(`[Socket.IO] Total connected clients: ${connectedSockets}`);
}, 30000);

// Serve static files
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// All routes -> index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

// Start server
const PORT = 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log('[Socket.IO] Server initialized and ready for connections');
});