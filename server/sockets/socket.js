const { Server } = require('socket.io');
const logger = require('../utils/logger');

let ioInstance = null;

/**
 * Two kinds of "rooms" clients can join:
 *  - `service:<serviceId>`  -> anyone watching a department's live queue
 *                              (the booking screen, staff counter screen,
 *                              admin dashboard)
 *  - `token:<tokenId>`      -> the specific customer watching THEIR token
 *                              (gets personal "you're being called" pushes)
 */
function initSocket(httpServer, clientOrigin) {
  ioInstance = new Server(httpServer, {
    cors: { origin: clientOrigin, credentials: true },
  });

  ioInstance.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('joinServiceRoom', (serviceId) => {
      socket.join(`service:${serviceId}`);
    });

    socket.on('joinTokenRoom', (tokenId) => {
      socket.join(`token:${tokenId}`);
    });

    socket.on('joinAdminRoom', () => {
      socket.join('admin-room');
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.io was not initialized — call initSocket() first in server.js');
  return ioInstance;
}

// Broadcast to everyone watching a department's queue (booking screens,
// counter screens, admin dashboard).
function emitToService(serviceId, event, payload) {
  if (!ioInstance) return; // socket not initialized (e.g. during tests) — fail silently
  ioInstance.to(`service:${serviceId}`).emit(event, payload);
}

// Push a personal update to whoever is watching one specific token.
function emitToToken(tokenId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`token:${tokenId}`).emit(event, payload);
}

// Broadcast a human-readable activity entry to the admin dashboard's
// live activity feed (booked, called, served, no-show, etc. across
// every department at once).
function emitToAdmin(event, payload) {
  if (!ioInstance) return;
  ioInstance.to('admin-room').emit(event, payload);
}

module.exports = { initSocket, getIO, emitToService, emitToToken, emitToAdmin };
