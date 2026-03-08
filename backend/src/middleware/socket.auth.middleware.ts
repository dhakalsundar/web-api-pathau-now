

import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface SocketAuthData {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      socketAuth?: SocketAuthData;
    }
  }
}

export function socketAuthMiddleware(socket: Socket, next: (error?: Error) => void) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'default';

  

    let token: string | undefined;

    // Try query parameter first
    if (typeof socket.handshake.auth?.token === 'string') {
      token = socket.handshake.auth.token;
    }

    // Try Authorization header
    if (!token && socket.handshake.headers.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Try cookies
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === 'auth_token') {
          token = decodeURIComponent(value);
          break;
        }
      }
    }

    if (!token) {
      logger.warn(` [SocketAuth] Connection attempt without token - Socket: ${socket.id}`);
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.id && !decoded.userId) {
      logger.warn(` [SocketAuth] Invalid token structure - Socket: ${socket.id}`);
      return next(new Error('Authentication error: Invalid token structure'));
    }

    // Extract user data from token
    const userId = decoded.id || decoded.userId;
    const email = decoded.email;
    const role = decoded.role?.toUpperCase() || 'USER';

    // Attach auth data to socket
    (socket as any).auth = {
      userId,
      email,
      role,
    };

    // Log successful authentication
    logger.info(` [SocketAuth] Socket authenticated - ID: ${socket.id}, User: ${userId}, Role: ${role}`);

    next();
  } catch (error: any) {
    const message = error.message || 'Authentication error';
    logger.error(` [SocketAuth] Authentication failed - Socket: ${socket.id}, Error: ${message}`);
    next(new Error(`Authentication error: ${message}`));
  }
}

/**
 * Socket event handlers for room management
 * Joins users to their specified rooms based on role
 */
export function setupSocketEventHandlers(socket: Socket) {
  const auth = (socket as any).auth as SocketAuthData;

  if (!auth) {
    logger.warn(` [SocketEvents] No auth data for socket ${socket.id}`);
    return;
  }

  const { userId, role } = auth;

  // Join to user-specific room (for direct notifications)
  socket.join(`user:${userId}`);
  logger.info(` [SocketEvents] Socket ${socket.id} joined room: user:${userId}`);

  // Join to role-specific room
  if (role === 'RIDER') {
    socket.join('riders');
    socket.join(`rider:${userId}`);
    logger.info(` [SocketEvents] Socket ${socket.id} joined rooms: riders, rider:${userId}`);
  } else if (role === 'ADMIN') {
    socket.join('admins');
    logger.info(` [SocketEvents] Socket ${socket.id} joined room: admins`);
  }

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(` [SocketEvents] Socket disconnected - ID: ${socket.id}, User: ${userId}`);
  });

  // Handle errors
  socket.on('error', (error: any) => {
    logger.error(` [SocketEvents] Socket error - ID: ${socket.id}, Error: ${error?.message || error}`);
  });

  // Health check event (client can ping to verify connection)
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
}
