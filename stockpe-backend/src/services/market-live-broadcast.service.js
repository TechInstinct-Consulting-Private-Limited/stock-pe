const { WebSocketServer, WebSocket } = require("ws");

function attachMarketLiveBroadcast(server, { getInitialIndices, intervalMs = 500 } = {}) {
  const clients = new Set();
  const webSocketServer = new WebSocketServer({ noServer: true });
  let latestBySymbol = new Map();
  let timer;

  const broadcast = () => {
    timer = null;
    if (!latestBySymbol.size) return;
    const body = JSON.stringify({ type: "market_tick", data: [...latestBySymbol.values()], generatedAt: new Date().toISOString() });
    latestBySymbol = new Map();
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(body);
    });
  };

  webSocketServer.on("connection", async (socket) => {
    clients.add(socket);
    try {
      const initial = await getInitialIndices?.();
      if (socket.readyState === WebSocket.OPEN && initial?.length) {
        socket.send(JSON.stringify({ type: "market_snapshot", data: initial, generatedAt: new Date().toISOString() }));
      }
    } catch (_) { /* REST fallback remains available to clients. */ }
    socket.on("close", () => clients.delete(socket));
  });

  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname !== "/api/market/live") return;
    webSocketServer.handleUpgrade(request, socket, head, (client) => webSocketServer.emit("connection", client, request));
  });

  return {
    publish(quote) {
      if (!quote?.rawSymbol) return;
      latestBySymbol.set(quote.rawSymbol, quote);
      if (!timer) timer = setTimeout(broadcast, Math.max(100, Number(intervalMs) || 500));
    },
    close() {
      clearTimeout(timer);
      clients.forEach((client) => client.close());
      webSocketServer.close();
    },
  };
}

module.exports = { attachMarketLiveBroadcast };
