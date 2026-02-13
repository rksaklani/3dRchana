const WebSocket = require('ws');

const rooms = new Map();

function getRoom(projectId) {
  if (!rooms.has(projectId)) rooms.set(projectId, new Set());
  return rooms.get(projectId);
}

function attach(server) {
  const wss = new WebSocket.Server({ server, path: '/collab' });

  wss.on('connection', (ws, req) => {
    let projectId = null;
    let userId = null;
    let userName = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'join' && msg.projectId) {
          projectId = msg.projectId;
          userId = msg.userId || 'anonymous';
          userName = msg.userName || userId;
          getRoom(projectId).add(ws);
          ws.projectId = projectId;
          broadcast(projectId, { type: 'userJoined', userId, userName }, ws);
        } else if (projectId && msg.type === 'camera') {
          broadcast(projectId, { type: 'camera', userId, userName, ...msg.payload }, ws);
        } else if (projectId && msg.type === 'annotationFocus') {
          broadcast(projectId, { type: 'annotationFocus', userId, userName, annotationId: msg.annotationId }, ws);
        }
      } catch (_) {}
    });

    ws.on('close', () => {
      if (projectId) {
        const room = getRoom(projectId);
        room.delete(ws);
        if (room.size === 0) rooms.delete(projectId);
        broadcast(projectId, { type: 'userLeft', userId, userName }, null);
      }
    });
  });

  function broadcast(projectId, payload, exclude) {
    const room = getRoom(projectId);
    const data = JSON.stringify(payload);
    room.forEach((client) => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  return wss;
}

module.exports = { attach };