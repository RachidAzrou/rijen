import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { WebSocketServer } from 'ws';

admin.initializeApp();

// Store room statuses in Firestore
const roomStatuses: { [key: string]: 'OK' | 'NOK' | 'OFF' } = {
  'prayer-ground': 'OFF',
  'prayer-first': 'OFF',
  'garage': 'OFF'
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
      data: roomStatuses
    }));

    ws.on('message', async (message) => {
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

  // Handle the upgrade
  wss.handleUpgrade(request, request.socket, Buffer.from(''), (ws) => {
    wss.emit('connection', ws, request);
  });
});

// API endpoint for health check
export const health = functions.https.onRequest((request, response) => {
  response.json({ status: 'ok' });
});