import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/chat_message.dart';

class ChatSocketService {
  String? get socketId => _socketId;
  final String reverbHost;
  final int reverbPort;
  final String reverbAppKey;
  final bool useTLS;
  final Dio dio; // dipakai buat hit /broadcasting/auth (Sanctum)

  WebSocketChannel? _channel;
  String? _socketId;
  String? _currentChannel;
  Timer? _reconnectTimer;
  bool _disposed = false;

  final _messageController = StreamController<ChatMessage>.broadcast();
  Stream<ChatMessage> get messages => _messageController.stream;

  ChatSocketService({
    required this.reverbHost,
    required this.reverbPort,
    required this.reverbAppKey,
    required this.dio,
    this.useTLS = false,
  });

  void connectToTransaction(String transactionId) {
    _disposed = false;
    _currentChannel = 'private-transaction.$transactionId';
    _connect();
  }

  void _connect() {
    debugPrint("🟢 TRANSACTION CONNECT");
    final scheme = useTLS ? 'wss' : 'ws';
    final uri = Uri.parse(
      '$scheme://$reverbHost:$reverbPort/app/$reverbAppKey?protocol=7&client=flutter&version=1.0',
    );

    _channel = WebSocketChannel.connect(uri);

    _channel!.stream.listen(
      (raw) => _onMessage(raw as String),
      onDone: () {
        if (_disposed) return;

        debugPrint("🔴 Transaction socket closed");
        _scheduleReconnect();
      },
      onError: (e) {
        if (_disposed) return;

        debugPrint("🔴 Transaction socket error: $e");
        _scheduleReconnect();
      },
    );
  }

  void _onMessage(String raw) async {
    debugPrint("RAW => $raw");
    debugPrint("🔥 TRANSACTION EVENT");
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    final event = decoded['event'] as String?;

    if (event == 'pusher:connection_established') {
      final data =
          jsonDecode(decoded['data'] as String) as Map<String, dynamic>;
      _socketId = data['socket_id'] as String;
      await _subscribeToChannel();
      return;
    }

    if (event == 'client-message.sent' || event == 'message.sent') {
      final data = decoded['data'];
      final payload = data is String
          ? jsonDecode(data) as Map<String, dynamic>
          : data as Map<String, dynamic>;
      _messageController.add(ChatMessage.fromJson(payload));
      return;
    }
  }

  Future<void> _subscribeToChannel() async {
    if (_socketId == null || _currentChannel == null) return;

    try {
      final authResponse = await dio.post(
        '/broadcasting/auth',
        data: {'socket_id': _socketId, 'channel_name': _currentChannel},
      );

      final auth = authResponse.data['auth'] as String;

      _channel?.sink.add(
        jsonEncode({
          'event': 'pusher:subscribe',
          'data': {'auth': auth, 'channel': _currentChannel},
        }),
      );
    } catch (_) {
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    debugPrint("🟡 TRANSACTION RECONNECT");
    if (_disposed) return;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 3), () {
      if (!_disposed) _connect();
    });
  }

  void dispose() {
    debugPrint("🔴 TRANSACTION SOCKET DISPOSE");
    _disposed = true;

    _reconnectTimer?.cancel();

    _channel?.sink.close();
    _channel = null;

    _messageController.close();
  }
}
