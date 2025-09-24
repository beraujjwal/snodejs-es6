import { Server } from 'socket.io';
import { info } from '../../helpers/logger.js';
// Simulated user management functions
const users = new Map(); // key: socketId, value: { name, room }

function addUser({ id, name, room }) {
  users.set(id, { name, room });
  return { user: users.get(id) };
}

function removeUser(id) {
  const user = users.get(id);
  users.delete(id);
  return user;
}

function getUser(id) {
  return users.get(id);
}

class SocketEvent {
  static io = null; // Singleton instance of socket.io

  /**
   * Initialize socket.io server
   * @param {http.Server} httpServer - The HTTP/HTTPS server
   */
  static init(httpServer) {
    if (!SocketEvent.io) {
      SocketEvent.io = new Server(httpServer, {
        cors: {
          origin: '*', // Update with your frontend domain(s)
        },
      });

      SocketEvent.io.on('connection', SocketEvent.connectionHandler);

      info('🔌  Socket.io initialized');
    }
    return SocketEvent.io;
  }

  // Handle new client connections
  static connectionHandler(socket) {
    info(`Client connected: ${socket.id}`);

    // Example: listen for "join" event from client
    socket.on('join', ({ userName, roomName }, callback) => {
      const { user } = addUser({
        id: socket.id,
        name: userName,
        room: roomName,
      });

      // Add user to room
      socket.join(roomName);

      // Send welcome message to the new user
      socket.emit('message', {
        user: 'admin',
        text: `Welcome ${user.name} to room ${user.room}`,
      });

      // Notify everyone else in the room
      socket.to(roomName).emit('message', {
        user: 'admin',
        text: `${user.name} has joined the room`,
      });

      callback(); // acknowledge join
    });

    socket.on('disconnect', () => {
      const user = removeUser(socket.id);
      if (user) {
        SocketEvent.io.to(user.room).emit('message', {
          user: 'admin',
          text: `${user.name} has left the room`,
        });
      }
      info(`Client disconnected: ${socket.id}`);
    });
  }

  /**
   * Get io instance (after initialization)
   */
  static getIO() {
    if (!SocketEvent.io) {
      throw new Error(
        'Socket.io not initialized. Call SocketEventManager.init() first.'
      );
    }
    return SocketEvent.io;
  }

  /**
   * Emit event to all clients
   * @param {string} event - Event name
   * @param {any} data - Payload to send
   */
  static emit(event, data) {
    SocketEvent.getIO().emit(event, data);
    info(`📢 Event emitted: ${event}`, data);
  }

  /**
   * Emit event to a specific room
   * @param {string} room - Room name
   * @param {string} event - Event name
   * @param {any} data - Payload
   */
  static emitToRoom(room, event, data) {
    SocketEvent.getIO().to(room).emit(event, data);
    info(`📢 Event emitted to room [${room}]: ${event}`, data);
  }

  /**
   * Emit event to a specific client
   * @param {string} socketId - Client socket ID
   * @param {string} event - Event name
   * @param {any} data - Payload
   */
  static emitToClient(socketId, event, data) {
    SocketEvent.getIO().to(socketId).emit(event, data);
    info(`📢 Event emitted to client [${socketId}]: ${event}`, data);
  }
}

export default SocketEvent;
