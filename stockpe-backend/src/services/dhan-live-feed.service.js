const WebSocket = require("ws");

const DHAN_LIVE_FEED_URL = "wss://api-feed.dhan.co";
const RESPONSE_CODES = {
  TICKER: 2,
  PREVIOUS_CLOSE: 6,
};

function isDhanLiveFeedEnabled(env = process.env) {
  return String(env.MARKET_TICK_STREAM_ENABLED || "").toLowerCase() === "true"
    && String(env.MARKET_DATA_PROVIDER || "").toLowerCase() === "dhan"
    && Boolean(String(env.DHAN_CLIENT_ID || "").trim())
    && Boolean(String(env.DHAN_ACCESS_TOKEN || "").trim());
}

function parseDhanPacket(payload) {
  const buffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  if (buffer.length < 8) return null;
  const responseCode = buffer.readUInt8(0);
  const securityId = buffer.readInt32LE(4);

  // Dhan sends little-endian binary packets. Ticker packets include LTP and
  // exchange time; previous-close packets are used only to calculate change.
  if (responseCode === RESPONSE_CODES.TICKER && buffer.length >= 12) {
    return { type: "ticker", securityId, lastPrice: buffer.readFloatLE(8) };
  }
  if (responseCode === RESPONSE_CODES.PREVIOUS_CLOSE && buffer.length >= 12) {
    return { type: "previous-close", securityId, previousClose: buffer.readFloatLE(8) };
  }
  return null;
}

function startDhanLiveFeed({ subscriptions, onTick, env = process.env, WebSocketImpl = WebSocket } = {}) {
  if (!isDhanLiveFeedEnabled(env) || !subscriptions?.length) {
    return { stop: () => {}, getStatus: () => ({ enabled: false, connected: false, provider: "dhan" }) };
  }

  let socket;
  let stopped = false;
  let reconnectTimer;
  let reconnectAttempt = 0;
  const previousCloseBySecurityId = new Map();
  const status = { enabled: true, connected: false, provider: "dhan", lastTickAt: null, lastErrorAt: null };
  const url = `${DHAN_LIVE_FEED_URL}?version=2&token=${encodeURIComponent(env.DHAN_ACCESS_TOKEN)}&clientId=${encodeURIComponent(env.DHAN_CLIENT_ID)}&authType=2`;

  const subscriptionsBySecurityId = new Map(subscriptions.map((item) => [Number(item.securityId), item]));
  const scheduleReconnect = () => {
    if (stopped) return;
    const delay = Math.min(30_000, 1_000 * (2 ** reconnectAttempt));
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(connect, delay);
  };

  const connect = () => {
    socket = new WebSocketImpl(url);
    socket.on("open", () => {
      reconnectAttempt = 0;
      status.connected = true;
      socket.send(JSON.stringify({
        RequestCode: 15,
        InstrumentCount: subscriptions.length,
        InstrumentList: subscriptions.map((item) => ({
          ExchangeSegment: item.exchangeSegment,
          SecurityId: String(item.securityId),
        })),
      }));
    });
    socket.on("message", (data) => {
      const packet = parseDhanPacket(data);
      if (!packet) return;
      const subscription = subscriptionsBySecurityId.get(packet.securityId);
      if (!subscription) return;
      if (packet.type === "previous-close") {
        previousCloseBySecurityId.set(packet.securityId, packet.previousClose);
        return;
      }
      status.lastTickAt = new Date().toISOString();
      onTick?.({
        ...packet,
        exchangeSegment: subscription.exchangeSegment,
        previousClose: previousCloseBySecurityId.get(packet.securityId),
      });
    });
    socket.on("error", () => { status.lastErrorAt = new Date().toISOString(); });
    socket.on("close", () => {
      status.connected = false;
      scheduleReconnect();
    });
  };

  connect();
  return {
    stop() {
      stopped = true;
      clearTimeout(reconnectTimer);
      socket?.terminate?.();
      status.connected = false;
    },
    getStatus: () => ({ ...status }),
  };
}

module.exports = { DHAN_LIVE_FEED_URL, isDhanLiveFeedEnabled, parseDhanPacket, startDhanLiveFeed };
