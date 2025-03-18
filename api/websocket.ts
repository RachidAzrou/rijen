import { Server } from 'ws';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const rooms = {
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
};

const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
  // Send initial status to new clients
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
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.upgrade?.toLowerCase() !== 'websocket') {
    res.status(426).send('Upgrade Required');
    return;
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
}