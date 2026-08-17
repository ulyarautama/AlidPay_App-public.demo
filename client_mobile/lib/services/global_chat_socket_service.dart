import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/chat_message.dart';

/// Sama arsitekturnya kaya ChatSocketService, tapi subscribe ke channel
/// milik USER (bukan per-transaksi), jadi bisa nangkep notif chat dari
/// SEMUA transaksi sekaligus, biarpun user lagi buka layar lain.
class GlobalChatSocketService {
  final String reverbHost;
  final int reverbPort;
  final String reverbAppKey;
  final bool useTLS;
  final Dio dio;

  WebSocketChannel? _channel;
  String? _socketId;
  String? _userChannel;
  Timer? _reconnectTimer;
  bool _disposed = false;

  final _messageController = StreamController<ChatMessage>.broadcast();
  Stream<ChatMessage> get messages => _messageController.stream;

  GlobalChatSocketService({
    required this.reverbHost,
    required this.reverbPort,
    required this.reverbAppKey,
    required this.dio,
    this.useTLS = false,
  });

  void connectAsUser(String userId) {
    _disposed = false;
    _userChannel =
        'private-App.Models.User.$userId'; // 🟢 samain sama channels.php
    _connect();
  }

  void _connect() {
    final scheme = useTLS ? 'wss' : 'ws';
    final uri = Uri.parse(
      '$scheme://$reverbHost:$reverbPort/app/$reverbAppKey?protocol=7&client=flutter&version=1.0',
    );
    debugPrint('🟣 GlobalChatSocket connecting to: $uri'); // 🟢 tambahin ini

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
    debugPrint("🌍 GLOBAL EVENT");
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    final event = decoded['event'] as String?;

    if (event == 'pusher:connection_established') {
      final data =
          jsonDecode(decoded['data'] as String) as Map<String, dynamic>;
      _socketId = data['socket_id'] as String;
      await _subscribeToChannel();
      return;
    }

    if (event == 'message.sent') {
      final data = decoded['data'];
      final payload = data is String
          ? jsonDecode(data) as Map<String, dynamic>
          : data as Map<String, dynamic>;
      final message = ChatMessage.fromJson(payload);

      debugPrint('======================');
      debugPrint('EVENT DITERIMA');
      debugPrint('senderId      : ${message.senderId}');
      debugPrint('socketId      : $_socketId');
      debugPrint('payload       : $payload');
      debugPrint('======================');

      _messageController.add(message);
      return;
    }
  }

  Future<void> _subscribeToChannel() async {
    if (_socketId == null || _userChannel == null) return;

    try {
      final authResponse = await dio.post(
        '/broadcasting/auth',
        data: {'socket_id': _socketId, 'channel_name': _userChannel},
      );

      final auth = authResponse.data['auth'] as String;

      _channel?.sink.add(
        jsonEncode({
          'event': 'pusher:subscribe',
          'data': {'auth': auth, 'channel': _userChannel},
        }),
      );
    } catch (_) {
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_disposed) return;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 3), () {
      if (!_disposed) _connect();
    });
  }

  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _messageController.close();
  }
}
