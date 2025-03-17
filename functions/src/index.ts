import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { WebSocketServer } from 'ws';

admin.initializeApp();

// Store room statuses in Firestore
const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Moskee +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Moskee +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
};

export const websocket = functions.https.onRequest((request, response) => {
  if (request.headers.upgrade?.toLowerCase() !== 'websocket') {
    response.status(426).send('Upgrade Required');
    return;
  }

  const wss = new WebSocketServer({ noServer: true });

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

  // Handle the upgrade
  wss.handleUpgrade(request, request.socket, Buffer.from(''), (ws) => {
    wss.emit('connection', ws, request);
  });
});

// API endpoint for health check
export const health = functions.https.onRequest((request, response) => {
  response.json({ status: 'ok' });
});