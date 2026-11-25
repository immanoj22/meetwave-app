
import io from 'socket.io-client';
import { Apiroutes } from './constant';

const URL = Apiroutes?.socketURL;

export const socket = io(URL, {
  path: '/socket.io',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,       // ✅ was 50ms — too aggressive
  reconnectionDelayMax: 5000,    // ✅ cap backoff at 5s
  randomizationFactor: 0.5,      // ✅ avoid thundering herd
  timeout: 10000,                // ✅ connection timeout
  jsonp: false,
});

export let socketId;

// ✅ Track connect
socket.on('connect', () => {
  socketId = socket.id;
  console.log('[Socket] Connected:', socket.id);
});

// ✅ Track disconnect reason — critical for debugging
socket.on('disconnect', (reason) => {
  console.warn('[Socket] Disconnected:', reason);

  // If server forcefully closed, manually reconnect
  if (reason === 'io server disconnect') {
    socket.connect();
  }
  // All other reasons: socket auto-reconnects by itself
});

const isSocketIoVersionMismatch = (message) =>
  typeof message === 'string' &&
  message.includes('trying to reach a Socket.IO server in v2.x with a v3.x client');

// ✅ Log connection errors (but don't spam the known version-mismatch banner)
socket.on('connect_error', (error) => {
  const msg = error?.message ?? String(error);
  if (isSocketIoVersionMismatch(msg)) {
    // This is almost always a wrong endpoint (old Socket.IO server) — keep it quiet in-app.
    console.warn('[Socket] Incompatible Socket.IO server/client versions. Check socketURL.');
    return;
  }
  console.error('[Socket] Connection error:', msg);
});

// ✅ Fixed: disconnect first, update query, then reconnect
export const createConnection = (id) => {
  try {
    if (id) {
      const normalizedId = String(id);
      const existingId = socket.io?.opts?.query?.id != null
        ? String(socket.io.opts.query.id)
        : null;

      socket.io.opts.query = { id: normalizedId };

      if (socket.connected && existingId === normalizedId) {
        return;
      }

      if (socket.active && existingId === normalizedId) {
        return;
      }

      if (socket.connected || socket.active) {
        socket.disconnect();
      }

      socket.connect();
    }
  } catch (e) {
    console.error('[Socket] createConnection error:', e);
  }
};

export const ensureSocketConnection = (id) => {
  try {
    if (!id) {
      return;
    }

    const normalizedId = String(id);
    const existingId = socket.io?.opts?.query?.id != null
      ? String(socket.io.opts.query.id)
      : null;

    if (socket.connected && existingId === normalizedId) {
      return;
    }

    if (existingId !== normalizedId) {
      createConnection(normalizedId);
      return;
    }

    if (!socket.connected && !socket.active) {
      socket.connect();
    }
  } catch (e) {
    console.error('[Socket] ensureSocketConnection error:', e);
  }
};

export const disconnectSocketConnection = () => {
  try {
    if (socket.connected || socket.active) {
      socket.disconnect();
    }
  } catch (e) {
    console.error('[Socket] disconnectSocketConnection error:', e);
  }
};

export const JoinRoom      = (data) => socket.emit('JOINROOM', data);
export const HandleTyping  = (data) => socket.emit('TYPING', data);
export const StopTyping    = (data) => socket.emit('STOPTYPING', data);
export const get_SeenData  = (data) => socket.emit('GETSEENDATA', data);
export const REMOVE_ROOM   = (data) => socket.emit('REMOVE_ROOM', data);
export const MembersList   = (data) => socket.emit('MEMBER_LIST', data);
export const SeenUnseen    = (data) => socket.emit('SEEN_UNSEEN', data);
export const updateAppPresence = (data) => socket.emit('APP_PRESENCE', data);

const chatSocketHandlers = {
  SEEN_STATUS: new Set(),
  TYPING: new Set(),
  STOPTYPING: new Set(),
  ONLINE_OFFLINE: new Set(),
  MEMBER_RESPONSE: new Set(),
  messageResponse: new Set(),
  deleteResponse_me: new Set(),
  deleteResponse_every: new Set(),
  NEW_MEMBERS_ADD: new Set(),
  updateResponse: new Set(),
  messageId: new Set(),
};

let chatSocketBridgeReady = false;

const forwardChatSocketEvent = (eventName) => (payload) => {
  chatSocketHandlers[eventName]?.forEach((handler) => {
    try {
      handler(payload);
    } catch (error) {
      console.error(`[Socket] ${eventName} handler error:`, error);
    }
  });
};

export const ensureChatSocketBridge = () => {
  if (chatSocketBridgeReady) {
    return;
  }

  chatSocketBridgeReady = true;

  Object.keys(chatSocketHandlers).forEach((eventName) => {
    socket.on(eventName, forwardChatSocketEvent(eventName));
  });
};

export const subscribeChatSocket = (eventName, handler) => {
  if (!chatSocketHandlers[eventName]) {
    console.warn(`[Socket] Unknown chat event: ${eventName}`);
    return () => {};
  }

  ensureChatSocketBridge();
  chatSocketHandlers[eventName].add(handler);
  return () => {
    chatSocketHandlers[eventName].delete(handler);
  };
};

const waitForSocketConnection = (timeoutMs = 10000) =>
  new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    const cleanup = () => {
      clearTimeout(timeoutId);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
    };

    const handleConnect = () => {
      cleanup();
      resolve();
    };

    const handleError = (error) => {
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error || 'Socket connection failed')));
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Socket connection timeout'));
    }, timeoutMs);

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleError);

    if (!socket.active) {
      socket.connect();
    }
  });

export const CREATEMESSAGE = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await waitForSocketConnection();
    } catch (error) {
      reject(error);
      return;
    }

    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      socket.off('messageResponse', handleMessageResponse);
    };

    const resolveOnce = (payload) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(payload);
    };

    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const expectedMessageId = data?.messageId ? String(data.messageId) : null;
    const expectedInstanceId = data?.instanceId ? String(data.instanceId) : null;

    const handleMessageResponse = (response) => {
      if (!response || typeof response !== 'object') {
        return;
      }

      const responseMessageId = response?.messageId ? String(response.messageId) : null;
      const responseInstanceId = response?.instanceId?._id
        ? String(response.instanceId._id)
        : response?.instanceId
          ? String(response.instanceId)
          : null;

      if (
        ((expectedMessageId && responseMessageId === expectedMessageId) ||
          (!expectedMessageId && expectedInstanceId && responseInstanceId === expectedInstanceId)) &&
        (!expectedInstanceId || !responseInstanceId || responseInstanceId === expectedInstanceId)
      ) {
        resolveOnce({ status: true, data: response });
      }
    };

    const timeoutId = setTimeout(() => {
      rejectOnce(new Error('Message acknowledgement timeout'));
    }, 10000);

    socket.on('messageResponse', handleMessageResponse);

    if (typeof socket.timeout === 'function') {
      socket.timeout(10000).emit('CREATEMESSAGE', data, (error, response) => {
        if (error) {
          rejectOnce(new Error('Message acknowledgement timeout'));
          return;
        }

        if (response?.status) {
          resolveOnce(response);
        } else if (response?.message) {
          rejectOnce(new Error(response.message));
        }
      });
      return;
    }

    socket.emit('CREATEMESSAGE', data, (response) => {
      if (response?.status) {
        resolveOnce(response);
      } else if (response?.message) {
        rejectOnce(new Error(response.message));
      }
    });
  });
};
