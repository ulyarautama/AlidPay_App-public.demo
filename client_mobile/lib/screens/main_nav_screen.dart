import 'dart:async';
import 'package:client_mobile/providers/auth_provider.dart';
import 'package:client_mobile/providers/chat_notification_provider.dart';
import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/services/global_chat_socket_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'buyer_dashboard.dart';
import 'seller_dashboard.dart';
import 'chat_list_screen.dart';
import 'profile_screen.dart';
import '../models/transaction.dart';
import '../services/transaction_service.dart';
import '../theme/editorial_theme.dart';

class MainNavScreen extends StatefulWidget {
  final String role; // 'pembelian' atau 'penjual'
  const MainNavScreen({super.key, required this.role});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _selectedIndex = 0;
  Timer? _pollTimer;
  int _confirmCount = 0;

  bool get _isBuyer => widget.role != 'penjual';

  @override
  void initState() {
    super.initState();
    _loadCounts();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userId = context.read<AuthProvider>().user?.id;
      if (userId == null) return;

      final notifProvider = context.read<ChatNotificationProvider>();
      notifProvider.connect(
        GlobalChatSocketService(
          reverbHost: '192.168.1.4',
          reverbPort: 8080,
          reverbAppKey: 'kollx33aw9x360ayigrc',
          dio: DioClient.dio,
          useTLS: false,
        ),
        userId,
      );
    });

    _pollTimer = Timer.periodic(
      const Duration(seconds: 20),
      (_) => _loadCounts(),
    );
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadCounts() async {
    try {
      final currentUserId = context.read<AuthProvider>().user?.id;
      if (currentUserId == null) return;

      final trxList = await TransactionService.fetchTransactions();

      final myTrx = trxList
          .where(
            (t) => _isBuyer
                ? t.buyer.id == currentUserId
                : t.seller.id == currentUserId,
          )
          .toList();

      final confirmCount = myTrx
          .where((t) => t.status == AlidpayStatus.menungguKonfirmasi)
          .length;

      if (!mounted) return;
      setState(() {
        _confirmCount = confirmCount;
      });
    } catch (e) {
      debugPrint('Gagal memuat badge count: $e');
    }
  }

  void _onTabTapped(int index) {
    setState(() => _selectedIndex = index);
    _loadCounts();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _isBuyer ? const BuyerDashboard() : const SellerDashboard(),
      ChatListScreen(userRole: _isBuyer ? 'pembeli' : 'penjual'),
      const ProfileScreen(),
    ];

    final unreadChatCount = context
        .watch<ChatNotificationProvider>()
        .unreadCount;

    return Scaffold(
      backgroundColor: EditorialTheme.bg,
      extendBody: true, // Memungkinkan konten berada di belakang floating nav
      body: IndexedStack(index: _selectedIndex, children: pages),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            20,
            0,
            20,
            12,
          ), // Mengambang & tidak menempel
          child: Container(
            height: 66,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: EditorialTheme
                  .inkPrimary, // Dark warm background khas editorial
              borderRadius: BorderRadius.circular(
                36,
              ), // Style rounded kapsul ala macOS/iOS
              boxShadow: [
                BoxShadow(
                  color: EditorialTheme.inkPrimary.withValues(alpha: 0.18),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
              border: Border.all(
                color: EditorialTheme.surface.withValues(alpha: 0.12),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildNavItem(
                  index: 0,
                  label: 'Beranda',
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  badgeCount: _confirmCount,
                ),
                _buildNavItem(
                  index: 1,
                  label: 'Chat',
                  icon: Icons.chat_bubble_outline_rounded,
                  activeIcon: Icons.chat_bubble_rounded,
                  badgeCount: unreadChatCount,
                ),
                _buildNavItem(
                  index: 2,
                  label: 'Profil',
                  icon: Icons.person_outline_rounded,
                  activeIcon: Icons.person_rounded,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String label,
    required IconData icon,
    required IconData activeIcon,
    int badgeCount = 0,
  }) {
    final isSelected = _selectedIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => _onTabTapped(index),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          decoration: BoxDecoration(
            // Kapsul indikator saat tab dipilih (seperti di gambar sampel)
            color: isSelected
                ? EditorialTheme.surface.withValues(alpha: 0.15)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(26),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    isSelected ? activeIcon : icon,
                    color: isSelected
                        ? EditorialTheme
                              .accentOrange // Warna aksen aktif
                        : EditorialTheme.bg.withValues(
                            alpha: 0.5,
                          ), // Color soft inactive
                    size: 22,
                  ),
                  if (badgeCount > 0)
                    Positioned(
                      right: -8,
                      top: -4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 1,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 15,
                          minHeight: 15,
                        ),
                        decoration: BoxDecoration(
                          color: EditorialTheme.accentOrange,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: EditorialTheme.inkPrimary,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          badgeCount > 9 ? '9+' : '$badgeCount',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: EditorialTheme.bg,
                            fontSize: 8.5,
                            fontWeight: FontWeight.w700,
                            height: 1.1,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                label,
                maxLines: 1,
                style: EditorialTheme.body(
                  10.5,
                  weight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected
                      ? EditorialTheme.bg
                      : EditorialTheme.bg.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
