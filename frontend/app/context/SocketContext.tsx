/**
 * Socket Context for React
 * Manages WebSocket connection and provides socket instance to app
 */

'use client'; // Next.js client component

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  error: Error | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * SocketProvider Component
 * Wraps the app and provides Socket.IO connection
 */
export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't try to connect on server side
    if (typeof window === 'undefined') return;

    setConnectionStatus('connecting');

    const getToken = async () => {
      try {
        // Get token from cookies
        const cookieString = document.cookie;
        const cookies = cookieString.split(';');
        let token = '';

        for (const cookie of cookies) {
          const [key, value] = cookie.trim().split('=');
          if (key === 'auth_token') {
            token = decodeURIComponent(value);
            break;
          }
        }

        if (!token) {
          console.warn(' [SocketProvider] No auth token found in cookies, Socket.IO connection may fail');
          return null;
        }

        return token;
      } catch (err) {
        console.error(' [SocketProvider] Error reading auth token:', err);
        return null;
      }
    };

    const initSocket = async () => {
      try {
        const token = await getToken();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const newSocket = io(API_URL, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          auth: {
            token: token || '',
          },
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log(' [SocketIO] Connected to server');
          setIsConnected(true);
          setConnectionStatus('connected');
          setError(null);
        });

        newSocket.on('disconnect', () => {
          console.log(' [SocketIO] Disconnected from server');
          setIsConnected(false);
          setConnectionStatus('disconnected');
        });

        newSocket.on('connect_error', (err: any) => {
          console.error(' [SocketIO] Connection error:', err.message);
          setError(new Error(err.message));
          setConnectionStatus('disconnected');
        });

        newSocket.on('error', (err: any) => {
          console.error(' [SocketIO] Error:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        });

        // Health check
        setInterval(() => {
          if (newSocket.connected) {
            newSocket.emit('ping', {}, () => {
              // Pong received
            });
          }
        }, 30000); // Every 30 seconds

        setSocket(newSocket);
      } catch (err: any) {
        console.error(' [SocketProvider] Failed to initialize Socket.IO:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setConnectionStatus('disconnected');
      }
    };

    initSocket();

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionStatus,
    error,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to use Socket context
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
