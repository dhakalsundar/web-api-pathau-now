/**
 * Socket Event Initializer Component
 * Initializes all socket event listeners when app loads
 * Should be placed near the root of the app
 */

'use client';

import { useSocketEventListeners } from '@/app/hooks/useSocketEventListeners';

/**
 * This component uses the useSocketEventListeners hook to set up all listeners
 * It doesn't render anything, just sets up the listeners
 */
export function SocketEventInitializer() {
  useSocketEventListeners();
  return null;
}
