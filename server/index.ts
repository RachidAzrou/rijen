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
  }
});

// Store room statuses
const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send initial status to new client
  socket.emit("initialStatus", rooms);

  // Handle status updates
  socket.on("updateStatus", ({ room, status }) => {
    if (rooms[room]) {
      rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
      console.log(`Updated ${room} status to ${rooms[room].status}`);

      // Broadcast the update to all clients
      io.emit("statusUpdated", {
        room,
        status: rooms[room].status
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// All routes -> index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
});

// Start server
const PORT = 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});