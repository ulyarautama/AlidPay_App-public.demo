import 'package:client_mobile/widgets/skeleton/dashboard_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:client_mobile/providers/auth_provider.dart';
import 'package:client_mobile/screens/confirmation_list_screen.dart';
import 'package:client_mobile/screens/seller_create_alidpay_screen.dart';
import 'package:client_mobile/services/transaction_service.dart';
import '../models/transaction.dart';
import '../widgets/transaction_card.dart';
import '../widgets/formatters.dart';
import 'detail_screen.dart';
import 'riwayat_screen.dart';
import '../theme/editorial_theme.dart';
import 'package:flutter/services.dart';

class SellerDashboard extends StatefulWidget {
  const SellerDashboard({super.key});

  @override
  State<SellerDashboard> createState() => _SellerDashboardState();
}

class _SellerDashboardState extends State<SellerDashboard> {
  AlidpayStatus? filter;
  bool _isBalanceHidden = false;
  late Future<List<AlidpayTransaction>> _futureTrx;

  @override
  void initState() {
    super.initState();
    _loadHiddenStatus();
    _futureTrx = TransactionService.fetchTransactions();
  }

  Future<void> _loadHiddenStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isBalanceHidden = prefs.getBool('is_balance_hidden') ?? false;
    });
  }

  Future<void> _toggleBalanceVisibility() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isBalanceHidden = !_isBalanceHidden;
      prefs.setBool('is_balance_hidden', _isBalanceHidden);
    });
  }

  Future<void> _refresh() async {
    setState(() {
      _futureTrx = TransactionService.fetchTransactions();
    });
    await _futureTrx;
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: EditorialTheme.bg,
      body: SafeArea(
        child: FutureBuilder<List<AlidpayTransaction>>(
          future: _futureTrx,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const DashboardSkeleton();
            }

            if (snapshot.hasError) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline_rounded,
                        size: 36,
                        color: EditorialTheme.accentOrange,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Gagal memuat data.',
                        style: EditorialTheme.display(
                          16,
                          weight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Tarik layar ke bawah untuk mencoba lagi',
                        style: EditorialTheme.body(13),
                      ),
                    ],
                  ),
                ),
              );
            }

            final myTrx = (snapshot.data ?? [])
                .where((t) => t.seller.id == user?.id)
                .toList();

            final trxList = myTrx
                .where((t) => t.status != AlidpayStatus.menungguKonfirmasi)
                .where((t) => filter == null || t.status == filter)
                .toList();

            final pendapatanCair = myTrx
                .where((t) => t.status == AlidpayStatus.danaDicairkan)
                .fold<int>(0, (sum, t) => sum + t.totalDiterimaPenjual);

            final pendapatanTertahan = myTrx
                .where(
                  (t) =>
                      t.status == AlidpayStatus.danaDitahan ||
                      t.status == AlidpayStatus.barangDikirim,
                )
                .fold<int>(0, (sum, t) => sum + t.totalDiterimaPenjual);

            final perluKirim = myTrx
                .where((t) => t.status == AlidpayStatus.danaDitahan)
                .length;
            final selesaiCount = myTrx
                .where((t) => t.status == AlidpayStatus.danaDicairkan)
                .length;
            final menungguKonfirmasiCount = myTrx
                .where((t) => t.status == AlidpayStatus.menungguKonfirmasi)
                .length;

            return RefreshIndicator(
              onRefresh: _refresh,
              color: EditorialTheme.inkPrimary,
              child: ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
                children: [
                  // --- HEADER ---
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PENJUAL',
                            style: EditorialTheme.body(
                              10,
                              weight: FontWeight.w800,
                              color: EditorialTheme.accentOrange,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user?.name ?? 'Nama Penjual',
                            style: EditorialTheme.display(
                              20,
                              weight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                      InkWell(
                        borderRadius: BorderRadius.circular(20),
                        onTap: () async {
                          final id = user?.publicId;

                          if (id == null || id.isEmpty) return;

                          await Clipboard.setData(ClipboardData(text: id));

                          if (!context.mounted) return;

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'ID berhasil disalin',
                                style: EditorialTheme.body(
                                  13,
                                  color: Colors.white,
                                ),
                              ),
                              backgroundColor: EditorialTheme.inkPrimary,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: EditorialTheme.border),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'ID: ${user?.publicId ?? '-'}',
                                style: EditorialTheme.body(
                                  11,
                                  weight: FontWeight.w600,
                                  color: EditorialTheme.inkPrimary,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Icon(
                                Icons.content_copy_rounded,
                                size: 15,
                                color: EditorialTheme.gold,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // --- BANNER PENDAPATAN (STATEMENT CARD) ---
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: EditorialTheme.inkPrimary,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'TOTAL PENDAPATAN CAIR',
                              style: EditorialTheme.body(
                                12,
                                weight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            InkWell(
                              onTap: _toggleBalanceVisibility,
                              child: Icon(
                                _isBalanceHidden
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                color: const Color(0xFFA09E97),
                                size: 18,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _isBalanceHidden
                              ? 'Rp ••••••••'
                              : formatRupiah(pendapatanCair),
                          style: EditorialTheme.display(
                            30,
                            weight: FontWeight.w800,
                            color: EditorialTheme.gold,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Container(height: 1, color: const Color(0xFF2D2B28)),
                        const SizedBox(height: 18),
                        Row(
                          children: [
                            Expanded(
                              child: _statementMetric(
                                label: 'Tertahan',
                                value: _isBalanceHidden
                                    ? 'Rp ••••••••'
                                    : formatRupiah(pendapatanTertahan),
                              ),
                            ),
                            Container(
                              width: 1,
                              height: 32,
                              color: const Color(0xFF2D2B28),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: _statementMetric(
                                label: 'Perlu Dikirim',
                                value: _isBalanceHidden
                                    ? '••'
                                    : '$perluKirim Transaksi',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // --- ACTION BUTTON ---
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () async {
                        final result = await Navigator.push<bool>(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SellerCreateAlidpayScreen(),
                          ),
                        );
                        if (result == true && context.mounted) {
                          _refresh();
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(
                          color: EditorialTheme.inkPrimary,
                          width: 1.5,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        backgroundColor: Colors.white,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.add_rounded,
                            color: EditorialTheme.inkPrimary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Buat Transaksi Baru Dan Bagikan',
                            style: EditorialTheme.display(
                              14,
                              weight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // --- NOTIFIKASI KONFIRMASI (IF ANY) ---
                  if (menungguKonfirmasiCount > 0) ...[
                    InkWell(
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ConfirmationListScreen(),
                          ),
                        );
                        _refresh();
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: EditorialTheme.accentGold.withValues(
                            alpha: 0.12,
                          ),
                          border: Border.all(color: EditorialTheme.accentGold),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.hourglass_empty_rounded,
                              color: EditorialTheme.accentGold,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '$menungguKonfirmasiCount Transaksi menunggu konfirmasi',
                                    style: EditorialTheme.display(
                                      13,
                                      weight: FontWeight.w700,
                                    ),
                                  ),
                                  Text(
                                    'Tap untuk konfirmasi pesanan masuk',
                                    style: EditorialTheme.body(11),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.arrow_forward_ios_rounded,
                              size: 12,
                              color: EditorialTheme.inkPrimary,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // --- SUMMARY STATS (HAIRLINE SECTION) ---
                  Container(
                    padding: const EdgeInsets.symmetric(
                      vertical: 16,
                      horizontal: 12,
                    ),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: EditorialTheme.border),
                        bottom: BorderSide(color: EditorialTheme.border),
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => _navigateToHistory(
                              context,
                              myTrx,
                              user?.id,
                              true,
                            ),
                            child: _editorialStatItem(
                              'Selesai',
                              '$selesaiCount',
                              EditorialTheme.successGreen,
                            ),
                          ),
                        ),
                        Container(
                          width: 2,
                          height: 36,
                          color: EditorialTheme.border,
                        ),
                        Expanded(
                          child: InkWell(
                            onTap: () => _navigateToHistory(
                              context,
                              myTrx,
                              user?.id,
                              false,
                            ),
                            child: _editorialStatItem(
                              'Total Riwayat',
                              '${myTrx.length}',
                              EditorialTheme.inkPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // --- LIST PESANAN ---
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Daftar Pesanan',
                        style: EditorialTheme.display(
                          16,
                          weight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Filter Chips
                  SizedBox(
                    height: 34,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _editorialFilterChip('Semua', null),
                        ...AlidpayStatus.values
                            .where((s) => s != AlidpayStatus.menungguKonfirmasi)
                            .map((s) => _editorialFilterChip(s.label, s)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  if (trxList.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 48),
                      child: Center(
                        child: Text(
                          'Belum ada pesanan dalam kategori ini.',
                          style: EditorialTheme.body(13),
                        ),
                      ),
                    )
                  else
                    ...trxList.map(
                      (t) => TransactionCard(
                        trx: t,
                        onTap: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => DetailScreen(
                                trx: t,
                                userRole: 'penjual',
                                showChatOption: true,
                              ),
                            ),
                          );
                          _refresh();
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _statementMetric({required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: EditorialTheme.body(
            10,
            weight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: EditorialTheme.display(
            14,
            weight: FontWeight.w700,
            color: EditorialTheme.gold,
          ),
        ),
      ],
    );
  }

  Widget _editorialStatItem(String label, String value, Color accentColor) {
    return Column(
      children: [
        Text(
          value,
          style: EditorialTheme.display(
            20,
            weight: FontWeight.w800,
            color: accentColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(label, style: EditorialTheme.body(11, weight: FontWeight.w600)),
      ],
    );
  }

  Widget _editorialFilterChip(String label, AlidpayStatus? status) {
    final selected = filter == status;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(
          label,
          style: EditorialTheme.body(
            11,
            weight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected ? EditorialTheme.bg : EditorialTheme.inkPrimary,
          ),
        ),
        selected: selected,
        onSelected: (_) => setState(() => filter = status),
        selectedColor: EditorialTheme.inkPrimary,
        backgroundColor: EditorialTheme.surface,
        showCheckmark: false,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: selected ? EditorialTheme.inkPrimary : EditorialTheme.border,
          ),
        ),
      ),
    );
  }

  void _navigateToHistory(
    BuildContext context,
    List<AlidpayTransaction> myTrx,
    String? userId,
    bool startWithSelesai,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => RiwayatScreen(
          transactions: myTrx,
          userId: userId,
          accentColor: EditorialTheme.inkPrimary,
          title: 'Riwayat Penjualan',
          startWithSelesai: startWithSelesai,
        ),
      ),
    );
  }
}
