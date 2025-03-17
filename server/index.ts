import express from "express";

console.log('Starting server initialization...');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic health check endpoint
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Simple API endpoint to test server functionality
app.get('/api/status', (_, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
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
  app.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});