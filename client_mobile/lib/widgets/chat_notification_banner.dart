import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chat_notification_provider.dart';
import '../providers/auth_provider.dart';
import '../main.dart';
import '../models/chat_message.dart';
import '../screens/chat_screen.dart'; // Import ChatScreen lu di sini

class ChatNotificationBanner extends StatefulWidget {
  const ChatNotificationBanner({super.key});

  @override
  State<ChatNotificationBanner> createState() => _ChatNotificationBannerState();
}

class _ChatNotificationBannerState extends State<ChatNotificationBanner> {
  ChatMessage? _cachedMessage;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ChatNotificationProvider>();
    final currentMessage = provider.latestMessage;
    final user = context.watch<AuthProvider>().user;

    if (currentMessage != null) {
      _cachedMessage = currentMessage;
    }

    final isShowing = currentMessage != null;
    final displayMessage = _cachedMessage;

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: SafeArea(
        child: IgnorePointer(
          ignoring: !isShowing,
          child: AnimatedSlide(
            duration: const Duration(milliseconds: 320),
            curve: Curves.easeOutCubic,
            offset: isShowing ? Offset.zero : const Offset(0, -1.4),
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 250),
              opacity: isShowing ? 1 : 0,
              child: displayMessage == null
                  ? const SizedBox.shrink()
                  : GestureDetector(
                      onTap: () {
                        if (user == null) return;

                        final trxId = displayMessage.transactionId;
                        final role = user.role == 'penjual'
                            ? 'penjual'
                            : 'pembeli';

                        provider.dismissBanner();

                        // 🟢 LANGSUNG TEMBAK MASUK KE CHAT SCREEN SPESIFIK
                        navigatorKey.currentState?.push(
                          MaterialPageRoute(
                            builder: (_) => ChatScreen(
                              transactionId: trxId,
                              currentUserId: user.id,
                              currentUserRole: role,
                              lawanBicaraName: displayMessage.senderName,
                            ),
                          ),
                        );
                      },
                      onVerticalDragEnd: (details) {
                        if ((details.primaryVelocity ?? 0) < 0) {
                          provider.dismissBanner();
                        }
                      },
                      child: Container(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1F2937),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.25),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: const Color(0xFF3B82F6),
                                borderRadius: BorderRadius.circular(11),
                              ),
                              child: const Icon(
                                Icons.chat_bubble_rounded,
                                color: Colors.white,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    displayMessage.senderName,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    displayMessage.message,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
