import 'dart:async';

import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/providers/chat_notification_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/chat_message.dart';
import '../services/chat_service.dart';
import '../services/chat_socket_service.dart';

class ChatScreen extends StatefulWidget {
  final String transactionId;
  final String currentUserId;
  final String currentUserRole; // 'pembeli' atau 'penjual'
  final String lawanBicaraName;

  const ChatScreen({
    super.key,
    required this.transactionId,
    required this.currentUserId,
    required this.currentUserRole,
    required this.lawanBicaraName,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _scrollController = ScrollController();
  final _textController = TextEditingController();
  final _focusNode = FocusNode();

  late final ChatService _chatService;
  late final ChatSocketService _socketService;

  StreamSubscription<ChatMessage>? _messageSubscription;

  final List<ChatMessage> _messages = [];
  String? _nextCursor;
  bool _isLoadingOlderMessages = false;
  bool _isLoading = true;
  bool _isSending = false;
  bool _hasText = false;

  // Warna identitas sesuai role user (samain kayak warna dashboard)
  Color get _myColor => widget.currentUserRole.toLowerCase() == 'pembeli'
      ? const Color(0xFF8B5CF6) // ungu — dashboard pembeli
      : const Color(0xFF10B981); // ijo — dashboard penjual

  Color get _myColorSoft => _myColor.withValues(alpha: 0.10);

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatNotificationProvider>().setActiveTransaction(
        widget.transactionId,
      );
    });
    _chatService = ChatService(DioClient.dio);
    _socketService = ChatSocketService(
      reverbHost: '192.168.1.4',
      reverbPort: 8080,
      reverbAppKey: 'kollx33aw9x360ayigrc',
      dio: DioClient.dio,
    );

    _scrollController.addListener(_loadOlderMessagesWhenNearTop);

    _textController.addListener(() {
      final hasText = _textController.text.trim().isNotEmpty;
      if (hasText != _hasText) setState(() => _hasText = hasText);
    });

    _loadMessages();
    _listenSocket();
  }

  void _loadOlderMessagesWhenNearTop() {
    if (_scrollController.position.pixels <= 120) {
      _loadOlderMessages();
    }
  }

  Future<void> _loadOlderMessages() async {
    final cursor = _nextCursor;

    if (cursor == null || _isLoadingOlderMessages) {
      return;
    }

    setState(() => _isLoadingOlderMessages = true);

    try {
      final result = await _chatService.fetchMessages(
        widget.transactionId,
        cursor: cursor,
      );

      final olderMessages = result['messages'] as List<ChatMessage>;

      if (!mounted) return;

      setState(() {
        _messages.insertAll(0, olderMessages);
        _nextCursor = result['nextCursor'] as String?;
      });
    } catch (_) {
      // Gagal memuat pesan lama: user masih bisa mencoba scroll lagi.
    } finally {
      if (mounted) {
        setState(() => _isLoadingOlderMessages = false);
      }
    }
  }

  Future<void> _loadMessages() async {
    try {
      final result = await _chatService.fetchMessages(widget.transactionId);
      final messages = result['messages'] as List<ChatMessage>;

      setState(() {
        _messages
          ..clear()
          ..addAll(messages);
        _nextCursor = result['nextCursor'] as String?;
        _isLoading = false;
      });
      _scrollToBottom(animated: false);

      // 🟢 FIX bug 1: backend udah mark is_read=true pas fetchMessages,
      // sekarang resync ke provider biar badge di TransactionCard/ChatListScreen
      // ilang seketika.
      if (mounted) {
        context.read<ChatNotificationProvider>().markTransactionAsRead(
          widget.transactionId,
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _showError('Gagal memuat pesan.');
    }
  }

  void _listenSocket() {
    _socketService.connectToTransaction(widget.transactionId);

    _messageSubscription = _socketService.messages.listen((incoming) async {
      if (!mounted) return;
      if (_messages.any((m) => m.id == incoming.id)) return;

      setState(() => _messages.add(incoming));
      _scrollToBottom();

      // 1. Update state di provider lokal agar badge di chat list langsung bersih
      context.read<ChatNotificationProvider>().markTransactionAsRead(
        widget.transactionId,
      );

      // 2. 🟢 FIX UTAMA: Tembak fetchMessages ke backend tanpa memasukkan hasilnya ke list.
      // Tujuannya murni memicu backend agar mengubah status 'is_read' pesan di database menjadi true/read.
      try {
        await _chatService.markMessagesAsRead(widget.transactionId);
      } catch (e) {
        debugPrint('Gagal sync read status ke server: $e');
      }
    });
  }

  Future<void> _handleSend() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() => _isSending = true);
    _textController.clear();

    try {
      final sent = await _chatService.sendMessage(
        widget.transactionId,
        text,
        socketId: _socketService.socketId,
      );
      if (!mounted) return;
      setState(() => _messages.add(sent));
      _scrollToBottom();
    } catch (_) {
      if (!mounted) return;
      _showError('Pesan gagal terkirim.');
      _textController.text = text;
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _scrollToBottom({bool animated = true}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      if (animated) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      } else {
        _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      }
    });
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  void dispose() {
    // 🟢 FIX ERROR 2: Batalkan subscription socket seketika sebelum widget dilepas
    _messageSubscription?.cancel();

    // 🟢 FIX ERROR 1: Jangan sentuh context provider lagi di sini! Bersih-bersih dipindah penuh ke PopScope.
    _socketService.dispose();
    _scrollController.removeListener(_loadOlderMessagesWhenNearTop);
    _scrollController.dispose();
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          // 🟢 AMAN: Di sini context root masih hidup dan stabil sebelum dihancurkan
          final notificationProvider = Provider.of<ChatNotificationProvider>(
            context,
            listen: false,
          );

          notificationProvider.clearActiveTransaction();
          notificationProvider
              .refreshAll(); // Tarik ulang unread count asli ke dashboard
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F8FA),
        appBar: _buildAppBar(),
        body: Column(
          children: [
            Expanded(child: _buildBody()),
            _buildInputBar(),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    final initial = widget.lawanBicaraName.isNotEmpty
        ? widget.lawanBicaraName[0].toUpperCase()
        : '?';

    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      surfaceTintColor: Colors.white,
      titleSpacing: 0,
      title: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [_myColor, _myColor.withValues(alpha: 0.65)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              initial,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 15,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.lawanBicaraName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    color: Color(0xFF1F2937),
                  ),
                ),
                Text(
                  'Transaksi Aman',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: const Color(0xFFF1F1F4)),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(color: _myColor, strokeWidth: 2.4),
      );
    }

    if (_messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: _myColorSoft,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.chat_bubble_outline_rounded,
                size: 32,
                color: _myColor,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              'Belum ada pesan',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Mulai obrolan dengan ${widget.lawanBicaraName}',
              style: TextStyle(fontSize: 12.5, color: Colors.grey.shade400),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 8),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final msg = _messages[index];
        final isMe = msg.senderId == widget.currentUserId;
        final showDateDivider = _shouldShowDateDivider(index);
        final isLastInGroup = _isLastInGroup(index);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (showDateDivider) _DateDivider(date: msg.createdAt),
            _ChatBubble(
              message: msg,
              isMe: isMe,
              color: isMe ? _myColor : const Color(0xFFEFEFF3),
              showTail: isLastInGroup,
            ),
          ],
        );
      },
    );
  }

  bool _shouldShowDateDivider(int index) {
    if (index == 0) return true;
    final current = _messages[index].createdAt.toLocal();
    final prev = _messages[index - 1].createdAt.toLocal();
    return current.year != prev.year ||
        current.month != prev.month ||
        current.day != prev.day;
  }

  bool _isLastInGroup(int index) {
    if (index == _messages.length - 1) return true;
    final current = _messages[index];
    final next = _messages[index + 1];
    return current.senderId != next.senderId;
  }

  Widget _buildInputBar() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: Container(
                constraints: const BoxConstraints(minHeight: 44),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: TextField(
                  controller: _textController,
                  focusNode: _focusNode,
                  minLines: 1,
                  maxLines: 5,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _handleSend(),
                  style: const TextStyle(fontSize: 14),
                  decoration: const InputDecoration(
                    hintText: 'Ketik pesan...',
                    hintStyle: TextStyle(
                      color: Color(0xFF9CA3AF),
                      fontSize: 14,
                    ),
                    filled: false,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 11,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOut,
              child: InkWell(
                onTap: (_hasText && !_isSending) ? _handleSend : null,
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: _hasText
                          ? [_myColor, _myColor.withValues(alpha: 0.75)]
                          : [Colors.grey.shade300, Colors.grey.shade300],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: _hasText
                        ? [
                            BoxShadow(
                              color: _myColor.withValues(alpha: 0.35),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ]
                        : null,
                  ),
                  child: _isSending
                      ? const Padding(
                          padding: EdgeInsets.all(13),
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(
                          Icons.arrow_upward_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DateDivider extends StatelessWidget {
  final DateTime date;

  const _DateDivider({required this.date});

  String _label() {
    final now = DateTime.now();
    final local = date.toLocal();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(local.year, local.month, local.day);
    final diff = today.difference(target).inDays;

    if (diff == 0) return 'Hari ini';
    if (diff == 1) return 'Kemarin';

    const bulan = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    return '${local.day} ${bulan[local.month - 1]} ${local.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: const Color(0xFFEFEFF3),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            _label(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.grey.shade600,
            ),
          ),
        ),
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;
  final Color color;
  final bool showTail;

  const _ChatBubble({
    required this.message,
    required this.isMe,
    required this.color,
    required this.showTail,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isMe ? Colors.white : const Color(0xFF1F2937);
    final timeColor = isMe ? Colors.white70 : const Color(0xFF9CA3AF);

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(bottom: showTail ? 12 : 3),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.74,
        ),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isMe ? 18 : (showTail ? 4 : 18)),
            bottomRight: Radius.circular(isMe ? (showTail ? 4 : 18) : 18),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message.message,
              style: TextStyle(color: textColor, fontSize: 14, height: 1.35),
            ),
            const SizedBox(height: 3),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _formatTime(message.createdAt),
                  style: TextStyle(color: timeColor, fontSize: 10),
                ),
                if (isMe) ...[
                  const SizedBox(width: 3),
                  Icon(Icons.done_all_rounded, size: 12, color: timeColor),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final local = dt.toLocal();
    final hh = local.hour.toString().padLeft(2, '0');
    final mm = local.minute.toString().padLeft(2, '0');
    return '$hh:$mm';
  }
}
