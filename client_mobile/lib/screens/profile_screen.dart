import 'package:client_mobile/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'edit_profile_screen.dart';
import '../models/transaction.dart';
import '../services/transaction_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isPembeli = user?.role != 'penjual';

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        title: const Text(
          'Profil',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: Color(0xFF1F2937),
          ),
        ),
        backgroundColor: const Color(0xFFF7F8FA),
        elevation: 0,
        centerTitle: false,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFF1F1F4)),
              ),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.person_rounded,
                      color: Color(0xFF3B82F6),
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? 'Pengguna',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'ID: ${user?.publicId ?? "No ID"}',
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: Color(0xFF9CA3AF),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      isPembeli ? 'Pembeli' : 'Penjual',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF3B82F6),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _TrustScoreBadge(userId: user?.id),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _menuTile(
              icon: Icons.edit_rounded,
              label: 'Edit Profil',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                );
              },
            ),
            _menuTile(
              icon: Icons.lock_outline_rounded,
              label: 'Keamanan',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Fitur keamanan segera hadir')),
                );
              },
            ),
            _menuTile(
              icon: Icons.help_outline_rounded,
              label: 'Bantuan',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Fitur bantuan segera hadir')),
                );
              },
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _confirmLogout(context),
                icon: const Icon(
                  Icons.logout_rounded,
                  color: Color(0xFFEF4444),
                ),
                label: const Text(
                  'Keluar',
                  style: TextStyle(
                    color: Color(0xFFEF4444),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: Color(0xFFFCA5A5)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _menuTile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFF1F1F4)),
          ),
          child: Row(
            children: [
              Icon(icon, size: 20, color: const Color(0xFF6B7280)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Color(0xFF9CA3AF)),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Keluar Akun',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        content: const Text('Yakin mau keluar dari akun ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AuthProvider>().logout();
            },
            child: const Text(
              'Keluar',
              style: TextStyle(
                color: Color(0xFFEF4444),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// 🟢 Badge "X Transaksi Sukses" — trust indicator sederhana buat buyer/seller lain
class _TrustScoreBadge extends StatefulWidget {
  final String? userId;
  const _TrustScoreBadge({required this.userId});

  @override
  State<_TrustScoreBadge> createState() => _TrustScoreBadgeState();
}

class _TrustScoreBadgeState extends State<_TrustScoreBadge> {
  late Future<int> _futureCount;

  @override
  void initState() {
    super.initState();
    _futureCount = _loadSuccessCount();
  }

  Future<int> _loadSuccessCount() async {
    if (widget.userId == null) return 0;
    final trxList = await TransactionService.fetchTransactions();
    return trxList
        .where(
          (t) =>
              (t.buyer.id == widget.userId || t.seller.id == widget.userId) &&
              t.status == AlidpayStatus.danaDicairkan,
        )
        .length;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<int>(
      future: _futureCount,
      builder: (context, snapshot) {
        final count = snapshot.data ?? 0;
        final isLoading = snapshot.connectionState == ConnectionState.waiting;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.verified_rounded,
                size: 15,
                color: Color(0xFF10B981),
              ),
              const SizedBox(width: 6),
              Text(
                isLoading ? 'Memuat...' : '$count Transaksi Sukses',
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF10B981),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
