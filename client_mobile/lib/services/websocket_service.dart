import 'package:flutter/widgets.dart';
import 'package:pusher_client_socket/pusher_client_socket.dart';

class WebSocketService {
  static VoidCallback? onTransactionUpdated;
  static PusherClient? _client;

  static const String _host = '192.168.1.4';
  static const int _wsPort = 8080;
  static const String _reverbAppKey = 'kollx33aw9x360ayigrc';

  static void init(String authToken, String userId) {
    if (_client != null) return;

    final options = PusherOptions(
      key: _reverbAppKey,
      host: _host,
      wsPort: _wsPort,
      encrypted: false,
      authOptions: PusherAuthOptions(
        'http://$_host:8000/api/broadcasting/auth',
        headers: () async {
          return {
            'Accept': 'application/json',
            'Authorization': 'Bearer $authToken',
          };
        },
      ),
      autoConnect: false,
      enableLogging: true,
    );

    _client = PusherClient(options: options);

    _client!.onConnectionEstablished((data) {
      debugPrint("WS connected! socket-id: ${_client!.socketId}");
    });

    _client!.onConnectionError((error) {
      debugPrint("WS connection error: $error");
    });

    _client!.onError((error) {
      debugPrint("WS error: $error");
    });

    _client!.onDisconnected((data) {
      debugPrint("WS disconnected: $data");
    });

    _client!.connect();

    final channel = _client!.private(
      'App.Models.User.$userId',
      subscribe: true,
    );

    channel.bind('transaction.updated', (data) {
      debugPrint("Ada update transaksi realtime: $data");

      onTransactionUpdated?.call();
    });
  }

  static void disconnect() {
    try {
      _client?.disconnect();
    } catch (e) {
      debugPrint("WebSocket disconnect gagal (diabaikan): $e");
    } finally {
      _client = null;
    }
  }
}
