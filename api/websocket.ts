import { Server } from 'ws';
import { createServer } from 'http';

const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
};

const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
  // Send initial status
  ws.send(JSON.stringify({
    type: 'initialStatus',
    data: rooms
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'updateStatus') {
        const { room, status } = data;
        if (rooms[room]) {
          rooms[room].status = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';

          // Broadcast to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify({
                type: 'statusUpdated',
                room,
                status: rooms[room].status
              }));
            }
          });
        }
      } else if (data.type === 'getInitialStatus') {
        ws.send(JSON.stringify({
          type: 'initialStatus',
          data: rooms
        }));
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