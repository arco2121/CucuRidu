package it.arco2121.cucuridu;

import android.content.res.AssetManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.io.IOException;
import java.io.InputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import fi.iki.elonen.NanoHTTPD;

@CapacitorPlugin(name = "LanServer")
public class LanServerPlugin extends Plugin {

    private LocalHttpServer httpServer;
    private LocalWsServer wsServer;
    private final Map<String, WebSocket> clients = new ConcurrentHashMap<>();
    private final Map<WebSocket, String> socketToId = new ConcurrentHashMap<>();

    @PluginMethod
    public void start(PluginCall call) {
        int httpPort = call.getInt("httpPort", 3000);
        int wsPort = call.getInt("wsPort", 3001);

        try {
            if (httpServer == null || wsServer == null) {
                stopServers();
                httpServer = new LocalHttpServer(httpPort, getContext().getAssets());
                httpServer.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);

                wsServer = new LocalWsServer(new InetSocketAddress("0.0.0.0", wsPort));
                wsServer.setReuseAddr(true);
                wsServer.start();
            }

            JSObject res = getNetworkInfoInternal(httpPort, wsPort);
            res.put("started", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Errore avvio server LAN: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopServers();
        JSObject res = new JSObject();
        res.put("stopped", true);
        call.resolve(res);
    }

    @PluginMethod
    public void getNetworkInfo(PluginCall call) {
        int httpPort = call.getInt("httpPort", 3000);
        int wsPort = call.getInt("wsPort", 3001);
        call.resolve(getNetworkInfoInternal(httpPort, wsPort));
    }

    @PluginMethod
    public void sendToClient(PluginCall call) {
        String clientId = call.getString("clientId");
        String payload = call.getString("payload");
        if (clientId != null && payload != null) {
            WebSocket conn = clients.get(clientId);
            if (conn != null && conn.isOpen()) {
                conn.send(payload);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void broadcast(PluginCall call) {
        String payload = call.getString("payload");
        if (payload != null) {
            for (WebSocket conn : clients.values()) {
                if (conn != null && conn.isOpen()) {
                    conn.send(payload);
                }
            }
        }
        call.resolve();
    }

    private String detectHotspotIp() {
        String fallbackSiteLocal = null;
        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface.getNetworkInterfaces();
            while (interfaces != null && interfaces.hasMoreElements()) {
                java.net.NetworkInterface nif = interfaces.nextElement();
                if (!nif.isUp() || nif.isLoopback()) continue;
                String name = nif.getName().toLowerCase();

                java.util.Enumeration<java.net.InetAddress> addrs = nif.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    java.net.InetAddress addr = addrs.nextElement();
                    if (addr.isLoopbackAddress() || !(addr instanceof java.net.Inet4Address)) continue;
                    String ip = addr.getHostAddress();
                    if (ip == null) continue;

                    // Priorita' alle interfacce Hotspot / Wi-Fi (Samsung usa spesso swlan0 o ap0)
                    if (name.startsWith("swlan") || name.startsWith("ap") || name.startsWith("wlan") || name.startsWith("rndis")) {
                        return ip;
                    }
                    if (addr.isSiteLocalAddress() && fallbackSiteLocal == null) {
                        fallbackSiteLocal = ip;
                    }
                }
            }
        } catch (Exception ignored) {}
        return fallbackSiteLocal;
    }

    // Libera le porte quando l'Activity viene chiusa, cosi' alla riapertura il bind non fallisce
    @Override
    protected void handleOnDestroy() {
        stopServers();
        super.handleOnDestroy();
    }

    // Piu' basso = preferito. Con Wi-Fi e Hotspot attivi insieme vince l'Hotspot
    private int interfacePriority(String name) {
        if (name.startsWith("swlan") || name.startsWith("ap") || name.startsWith("softap")) return 0;
        if (name.startsWith("wlan")) return name.equals("wlan0") ? 2 : 1;
        if (name.startsWith("rndis") || name.startsWith("eth")) return 3;
        return Integer.MAX_VALUE;
    }

    private void stopServers() {
        try {
            if (wsServer != null) {
                wsServer.stop(500);
                wsServer = null;
            }
        } catch (Exception ignored) {}
        clients.clear();
        socketToId.clear();

        if (httpServer != null) {
            httpServer.stop();
            httpServer = null;
        }
    }

    private JSObject getNetworkInfoInternal(int httpPort, int wsPort) {
        String bestIp = null;
        String fallbackSiteLocal = null;
        int bestPriority = Integer.MAX_VALUE;

        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces =
                    java.net.NetworkInterface.getNetworkInterfaces();

            while (interfaces != null && interfaces.hasMoreElements()) {
                java.net.NetworkInterface nif = interfaces.nextElement();
                if (!nif.isUp() || nif.isLoopback() || nif.isPointToPoint()) continue;

                String name = nif.getName().toLowerCase();
                // Esclude rete mobile (rmnet/ccmni), VPN (tun/wg) e interfacce fittizie
                if (name.startsWith("rmnet") || name.startsWith("ccmni") || name.startsWith("pdp")
                        || name.startsWith("ppp") || name.startsWith("clat") || name.startsWith("tun")
                        || name.startsWith("wg") || name.startsWith("dummy")) {
                    continue;
                }

                int priority = interfacePriority(name);

                java.util.Enumeration<java.net.InetAddress> addrs = nif.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    java.net.InetAddress addr = addrs.nextElement();
                    if (addr.isLoopbackAddress() || !(addr instanceof java.net.Inet4Address)) continue;

                    String ip = addr.getHostAddress();
                    if (ip == null || ip.startsWith("127.")) continue;

                    if (priority != Integer.MAX_VALUE) {
                        if (priority < bestPriority) {
                            bestIp = ip;
                            bestPriority = priority;
                        }
                    } else if (addr.isSiteLocalAddress() && fallbackSiteLocal == null) {
                        fallbackSiteLocal = ip;
                    }
                }
            }
        } catch (Exception ignored) {}

        // Fallback per Wi-Fi client tramite ConnectivityManager
        if (bestIp == null && getContext() != null) {
            try {
                android.net.ConnectivityManager cm = (android.net.ConnectivityManager)
                        getContext().getApplicationContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
                if (cm != null) {
                    android.net.Network active = cm.getActiveNetwork();
                    android.net.LinkProperties lp = cm.getLinkProperties(active);
                    if (lp != null) {
                        for (android.net.LinkAddress la : lp.getLinkAddresses()) {
                            java.net.InetAddress addr = la.getAddress();
                            if (addr instanceof java.net.Inet4Address && !addr.isLoopbackAddress()) {
                                String ip = addr.getHostAddress();
                                if (ip != null && addr.isSiteLocalAddress()) {
                                    bestIp = ip;
                                    break;
                                }
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // Ultimo fallback su altre interfacce locali (es. bridge/tethering)
        if (bestIp == null) {
            bestIp = fallbackSiteLocal;
        }

        boolean hasLanIp = (bestIp != null && !bestIp.isEmpty());
        String httpUrl = hasLanIp ? ("http://" + bestIp + ":" + httpPort) : "";
        String wsUrl = hasLanIp ? ("ws://" + bestIp + ":" + wsPort) : "";

        JSObject res = new JSObject();
        res.put("ip", hasLanIp ? bestIp : "");
        res.put("httpPort", httpPort);
        res.put("wsPort", wsPort);
        res.put("httpUrl", httpUrl);
        res.put("wsUrl", wsUrl);
        res.put("joinUrl", httpUrl);
        res.put("hasLanIp", hasLanIp);
        return res;
    }

    private class LocalWsServer extends WebSocketServer {
        public LocalWsServer(InetSocketAddress address) {
            super(address);
        }

        @Override
        public void onOpen(WebSocket conn, ClientHandshake handshake) {
            String clientId = UUID.randomUUID().toString();
            clients.put(clientId, conn);
            socketToId.put(conn, clientId);

            JSObject data = new JSObject();
            data.put("clientId", clientId);
            notifyListeners("clientConnected", data);
        }

        @Override
        public void onClose(WebSocket conn, int code, String reason, boolean remote) {
            String clientId = socketToId.remove(conn);
            if (clientId != null) {
                clients.remove(clientId);
                JSObject data = new JSObject();
                data.put("clientId", clientId);
                notifyListeners("clientDisconnected", data);
            }
        }

        @Override
        public void onMessage(WebSocket conn, String message) {
            String clientId = socketToId.get(conn);
            if (clientId != null) {
                JSObject data = new JSObject();
                data.put("clientId", clientId);
                data.put("payload", message);
                notifyListeners("clientMessage", data);
            }
        }

        @Override
        public void onError(WebSocket conn, Exception ex) {}

        @Override
        public void onStart() {}
    }

    private static class LocalHttpServer extends NanoHTTPD {
        private final AssetManager assets;

        public LocalHttpServer(int port, AssetManager assets) {
            super("0.0.0.0", port);
            this.assets = assets;
        }

        @Override
        public Response serve(IHTTPSession session) {
            String uri = session.getUri();
            if (uri == null || uri.equals("/") || uri.equals("/home") || uri.equals("/index")) {
                uri = "/index.html";
            } else if (uri.startsWith("/partecipaStanza/")) {
                uri = "/partecipaStanzaProfile.html";
            } else if (uri.equals("/partecipaStanza") && session.getParms() != null && session.getParms().containsKey("stanza")) {
                uri = "/partecipaStanzaProfile.html";
            } else if (!uri.contains(".")) {
                uri = uri + ".html";
            }

            String assetPath = "public" + uri;
            try {
                InputStream is = assets.open(assetPath);
                return newChunkedResponse(Response.Status.OK, getMimeType(uri), is);
            } catch (IOException e) {
                try {
                    InputStream fallback = assets.open("public/index.html");
                    return newChunkedResponse(Response.Status.OK, "text/html", fallback);
                } catch (IOException ex) {
                    return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not Found");
                }
            }
        }

        private String getMimeType(String uri) {
            if (uri.endsWith(".html")) return "text/html; charset=utf-8";
            if (uri.endsWith(".js")) return "application/javascript; charset=utf-8";
            if (uri.endsWith(".css")) return "text/css; charset=utf-8";
            if (uri.endsWith(".json")) return "application/json; charset=utf-8";
            if (uri.endsWith(".svg")) return "image/svg+xml";
            if (uri.endsWith(".png")) return "image/png";
            if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
            if (uri.endsWith(".webp")) return "image/webp";
            if (uri.endsWith(".ico")) return "image/x-icon";
            if (uri.endsWith(".ttf")) return "font/ttf";
            if (uri.endsWith(".mp3")) return "audio/mpeg";
            if (uri.endsWith(".ogg")) return "audio/ogg";
            return "application/octet-stream";
        }
    }
}