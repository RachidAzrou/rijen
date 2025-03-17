import { Server } from 'ws';
import { createServer } from 'http';

const roomStatuses: { [key: string]: 'OK' | 'NOK' | 'OFF' } = {
  'prayer-ground': 'OFF',
  'prayer-first': 'OFF',
  'garage': 'OFF'
};

const server = createServer();
const wss = new Server({ server });

wss.on('connection', (ws) => {
  // Send initial status
  ws.send(JSON.stringify({
    type: 'initialStatus',
    data: roomStatuses
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'getInitialStatus') {
        ws.send(JSON.stringify({
          type: 'initialStatus',
          data: roomStatuses
        }));
      } else if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (room && status && roomStatuses.hasOwnProperty(room)) {
          roomStatuses[room] = status;
          
          // Broadcast to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify({
                type: 'statusUpdated',
                room,
                status
              }));
            }
          });
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
});

export default function handler(req, res) {
  if (req.headers.upgrade?.toLowerCase() !== 'websocket') {
    res.status(426).send('Upgrade Required');
    return;
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
}
