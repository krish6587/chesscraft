import * as signalR from '@microsoft/signalr';

const HUB_URL = import.meta.env.VITE_HUB_URL || '/hubs/chess';

let connection = null;
let startPromise = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Event subscriber sets for connection lifecycle
const reconnectedListeners = new Set();
const reconnectingListeners = new Set();
const closeListeners = new Set();

/**
 * Get or create a SignalR connection to the Chess hub.
 * JWT token is dynamically fetched via accessTokenFactory to prevent stale tokens.
 */
export const getConnection = () => {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    return connection;
  }

  const conn = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => {
        return localStorage.getItem('chess_auth_token') || localStorage.getItem('token') || '';
      },
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        if (retryContext.previousRetryCount >= MAX_RECONNECT_ATTEMPTS) {
          return null; // Stop reconnecting
        }
        // Exponential backoff: 0s, 1s, 2s, 4s, 8s... capped at 30s
        const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        return delay;
      },
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  conn.onreconnecting((error) => {
    reconnectingListeners.forEach((cb) => {
      try { cb(error); } catch (e) { console.error(e); }
    });
  });

  conn.onreconnected((connectionId) => {
    reconnectedListeners.forEach((cb) => {
      try { cb(connectionId); } catch (e) { console.error(e); }
    });
  });

  conn.onclose((error) => {
    closeListeners.forEach((cb) => {
      try { cb(error); } catch (e) { console.error(e); }
    });
  });

  connection = conn;
  return connection;
};

/**
 * Start the SignalR connection if not already started.
 * Memoises starting promise to prevent errors in React StrictMode when start() is called concurrently.
 */
export const startConnection = async () => {
  const token = localStorage.getItem('chess_auth_token') || localStorage.getItem('token');
  if (!token) {
    console.warn('SignalR: No JWT token found in storage.');
    return null;
  }

  const conn = getConnection();
  if (!conn) return null;

  if (conn.state === signalR.HubConnectionState.Connected) {
    return conn;
  }

  if (conn.state === signalR.HubConnectionState.Connecting && startPromise) {
    return startPromise;
  }

  try {
    startPromise = (async () => {
      await conn.start();
      reconnectAttempts = 0;
      console.log('SignalR connected successfully:', conn.connectionId);
      return conn;
    })();

    const result = await startPromise;
    return result;
  } catch (err) {
    console.error('SignalR connection failed:', err);
    return null;
  } finally {
    startPromise = null;
  }
};

/**
 * Stop the SignalR connection gracefully and clear singleton.
 */
export const stopConnection = async () => {
  if (connection) {
    try {
      if (connection.state !== signalR.HubConnectionState.Disconnected) {
        await connection.stop();
        console.log('SignalR disconnected.');
      }
    } catch (err) {
      console.error('SignalR stop error:', err);
    }
  }
  connection = null;
  startPromise = null;
};

/**
 * Invoke a hub method with error handling.
 */
export const invokeHub = async (methodName, ...args) => {
  const conn = getConnection();
  if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
    console.warn(`SignalR: Cannot invoke '${methodName}' — not connected.`);
    return false;
  }

  try {
    await conn.invoke(methodName, ...args);
    return true;
  } catch (err) {
    console.error(`SignalR invoke '${methodName}' failed:`, err);
    return false;
  }
};

/**
 * Register an event handler on the connection.
 */
export const onHub = (eventName, callback) => {
  const conn = getConnection();
  if (!conn) return () => {};

  conn.on(eventName, callback);
  return () => conn.off(eventName, callback);
};

/**
 * Register reconnection event handlers.
 */
export const onReconnecting = (callback) => {
  reconnectingListeners.add(callback);
  return () => reconnectingListeners.delete(callback);
};

export const onReconnected = (callback) => {
  reconnectedListeners.add(callback);
  return () => reconnectedListeners.delete(callback);
};

export const onClose = (callback) => {
  closeListeners.add(callback);
  return () => closeListeners.delete(callback);
};

export const ConnectionState = signalR.HubConnectionState;
