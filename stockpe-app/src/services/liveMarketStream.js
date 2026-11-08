import { getApiBaseUrl } from "./api";

const listeners = new Set();
let socket;
let reconnectTimer;
let reconnectAttempt = 0;
let subscribers = 0;

function getStreamUrl() {
  return getApiBaseUrl().replace(/^http/i, "ws").replace(/\/$/, "") + "/market/live";
}

function emit(quotes) {
  if (Array.isArray(quotes) && quotes.length) listeners.forEach((listener) => listener(quotes));
}

function connect() {
  if (socket || subscribers <= 0) return;
  try {
    socket = new WebSocket(getStreamUrl());
    socket.onopen = () => { reconnectAttempt = 0; };
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "market_tick" || payload?.type === "market_snapshot") emit(payload.data);
      } catch (_) { /* Ignore malformed optional live updates; REST remains active. */ }
    };
    socket.onerror = () => socket?.close();
    socket.onclose = () => {
      socket = undefined;
      if (subscribers > 0) {
        const delay = Math.min(30_000, 1_000 * (2 ** reconnectAttempt));
        reconnectAttempt += 1;
        reconnectTimer = setTimeout(connect, delay);
      }
    };
  } catch (_) {
    socket = undefined;
  }
}

export function subscribeToLiveMarket(listener) {
  listeners.add(listener);
  subscribers += 1;
  connect();
  return () => {
    listeners.delete(listener);
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) {
      clearTimeout(reconnectTimer);
      socket?.close();
      socket = undefined;
      reconnectAttempt = 0;
    }
  };
}
