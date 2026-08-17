import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chat_notification_provider.dart';
import '../providers/auth_provider.dart';
import '../main.dart';
import '../screens/chat_list_screen.dart';

class GlobalChatBadge extends StatelessWidget {
  const GlobalChatBadge({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ChatNotificationProvider>();
    final unread = provider.unreadCount;
    final user = context.watch<AuthProvider>().user;

    // 1. Sembunyikan jika di dalam room chat
    if (provider.activeTransactionId != null) return const SizedBox.shrink();

    // 2. Sembunyikan jika unread kosong atau belum login
    if (unread <= 0 || user == null) return const SizedBox.shrink();

    // 🟢 FIX UTAMA KLIK MACET: Cek rute aktif saat ini menggunakan ModalRoute context.
    // Jika user sudah berada di halaman chat list, sembunyikan badgenya agar tidak menumpuk di atas layar!
    final currentRoute = ModalRoute.of(context);
    if (currentRoute?.settings.name == '/chat-list-screen') {
      return const SizedBox.shrink();
    }

    final role = user.role == 'penjual' ? 'penjual' : 'pembeli';

    return Positioned(
      top: 50,
      right: 14,
      child: SafeArea(
        child: GestureDetector(
          onTap: () {
            navigatorKey.currentState?.push(
              MaterialPageRoute(
                settings: const RouteSettings(name: '/chat-list-screen'),
                builder: (_) => ChatListScreen(userRole: role),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFFEF4444),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white, width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.chat_bubble_rounded,
                  color: Colors.white,
                  size: 13,
                ),
                const SizedBox(width: 5),
                Text(
                  unread > 9 ? '9+' : '$unread',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
