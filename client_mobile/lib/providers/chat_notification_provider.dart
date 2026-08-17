import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../models/chat_summary.dart';
import '../services/chat_service.dart';
import '../services/global_chat_socket_service.dart';

class ChatNotificationProvider extends ChangeNotifier {
  final ChatService chatService;
  GlobalChatSocketService? _socketService;
  String? activeTransactionId;

  int unreadCount = 0;
  ChatMessage? latestMessage;
  Map<String, ChatSummary> summaries = {}; // key: transactionId

  // 🟢 FIX bug 2: flag biar badge gak push berkali-kali kalau ChatListScreen udah kebuka
  bool isChatListOpen = false;

  ChatNotificationProvider({required this.chatService});

  void connect(GlobalChatSocketService socketService, String userId) {
    if (_socketService != null) return;

    _socketService = socketService;
    _socketService!.connectAsUser(userId);
    _socketService!.messages.listen(_onIncomingMessage);
    refreshAll();
  }

  // Di dalam class ChatNotificationProvider

  void _onIncomingMessage(ChatMessage message) {
    // 🟢 JIKA USER SEDANG DI ROOM CHAT TRANSAKSI INI
    if (activeTransactionId == message.transactionId) {
      debugPrint('=== CHAT MASUK DI ROOM AKTIF: BADGE & POPUP DI-BYPASS ===');

      // 1. JANGAN PERNAH TAMBAH unreadCount global (biarkan nilainya tetap)
      // 2. Paksa summary transaksi ini unread-nya tetap 0 secara instan
      summaries[message.transactionId] = ChatSummary(
        lastMessage: message.message,
        lastMessageAt: message.createdAt,
        unreadCount: 0, // Kunci di angka 0
      );

      // 3. Matikan banner pop-up (pastikan null)
      latestMessage = null;

      notifyListeners();
      return; // STOP DI SINI, jangan lari ke bawah!
    }

    // 🔴 JIKA USER DI LUAR ROOM CHAT (Baru boleh muncul badge + pop-up banner)
    debugPrint('Pesan masuk dari luar room: ${message.senderId}');
    unreadCount += 1;
    latestMessage = message;

    final existing = summaries[message.transactionId];
    summaries[message.transactionId] = ChatSummary(
      lastMessage: message.message,
      lastMessageAt: message.createdAt,
      unreadCount: (existing?.unreadCount ?? 0) + 1,
    );

    notifyListeners();

    Future.delayed(const Duration(seconds: 4), () {
      if (latestMessage?.id == message.id) {
        latestMessage = null;
        notifyListeners();
      }
    });
  }

  // Helper baru agar sinkronisasi ke server tidak merusak state lokal yang sudah bener
  // Future<void> _syncReadStatusSilently(String transactionId) async {
  //   try {
  //     // Asumsi: chatService punya method untuk hit API baca/buka chat secara remote
  //     // Jika tidak ada, kamu bisa sesuaikan dengan API backend-mu
  //     await chatService.markAsReadOnServer(transactionId);
  //   } catch (_) {}
  // }

  void setActiveTransaction(String transactionId) {
    activeTransactionId = transactionId;
    debugPrint("🟢 SET ACTIVE TRANSACTION: $activeTransactionId");
  }

  void clearActiveTransaction() {
    activeTransactionId = null;
    debugPrint("🔴 CLEAR ACTIVE TRANSACTION (Sekarang null)");
  }

  /// Refresh total unread count doang (dipanggil abis konek / polling ringan)
  Future<void> refreshUnreadCount() async {
    try {
      unreadCount = await chatService.fetchUnreadCount();
      notifyListeners();
    } catch (_) {}
  }

  /// Refresh summary per-transaksi (badge + last message tiap transaction card)
  Future<void> refreshSummaries() async {
    try {
      summaries = await chatService.fetchChatSummary();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> refreshAll() async {
    await Future.wait([refreshUnreadCount(), refreshSummaries()]);
  }

  /// 🟢 FIX bug 1: panggil ini abis user buka & baca chat transaksi tertentu
  /// (backend udah mark is_read=true, tinggal resync count-nya di client)
  Future<void> markTransactionAsRead(String transactionId) async {
    summaries[transactionId] =
        (summaries[transactionId] ?? ChatSummary(unreadCount: 0)).copyWith(
          unreadCount: 0,
        );
    notifyListeners();
    await refreshAll(); // resync bener-bener ke server biar akurat
  }

  void markChatListOpened() {
    isChatListOpen = true;
  }

  void markChatListClosed() {
    isChatListOpen = false;
  }

  void dismissBanner() {
    latestMessage = null;
    notifyListeners();
  }

  void reset() {
    _socketService?.dispose();
    _socketService = null;
    unreadCount = 0;
    latestMessage = null;
    summaries = {};
    isChatListOpen = false;
    notifyListeners();
  }
}
