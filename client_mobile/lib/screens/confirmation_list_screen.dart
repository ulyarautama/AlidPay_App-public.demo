import 'package:client_mobile/models/transaction.dart';
import 'package:client_mobile/providers/auth_provider.dart';
import 'package:client_mobile/providers/chat_notification_provider.dart';
import 'package:client_mobile/screens/detail_screen.dart';
import 'package:client_mobile/services/transaction_service.dart';
import 'package:client_mobile/widgets/formatters.dart';
import 'package:client_mobile/widgets/skeleton_loading.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ConfirmationListScreen extends StatefulWidget {
  const ConfirmationListScreen({super.key});

  @override
  State<ConfirmationListScreen> createState() => _ConfirmationListScreenState();
}

class _ConfirmationListScreenState extends State<ConfirmationListScreen> {
  late Future<List<AlidpayTransaction>> _futureTrx;
  final Set<String> _processingIds = {};

  @override
  void initState() {
    super.initState();

    _futureTrx = TransactionService.fetchTransactions();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _refresh() async {
    setState(() {
      _futureTrx = TransactionService.fetchTransactions();
    });
    await _futureTrx;
  }

  Future<void> _konfirmasi(AlidpayTransaction t) async {
    setState(() => _processingIds.add(t.id));
    try {
      await TransactionService.konfirmasiTrx(t.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('"${t.judulBarang}" berhasil dikonfirmasi.'),
          backgroundColor: const Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
        ),
      );
      await _refresh();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal mengonfirmasi transaksi.')),
      );
    } finally {
      if (mounted) setState(() => _processingIds.remove(t.id));
    }
  }

  Future<void> _tolak(AlidpayTransaction t) async {
    final yakin = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Tolak Transaksi'),
        content: Text('Yakin mau tolak "${t.judulBarang}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Tolak',
              style: TextStyle(color: Color(0xFFEF4444)),
            ),
          ),
        ],
      ),
    );
    if (yakin != true) return;

    setState(() => _processingIds.add(t.id));
    try {
      await TransactionService.tolakTrx(t.id);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('"${t.judulBarang}" ditolak.')));
      await _refresh();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Gagal menolak transaksi.')));
    } finally {
      if (mounted) setState(() => _processingIds.remove(t.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthProvider>().user?.id;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F8FA),
        appBar: AppBar(
          title: const Text(
            'Menunggu Konfirmasi',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 20),
          ),
          backgroundColor: const Color(0xFFF7F8FA),
          surfaceTintColor: const Color(0xFFF7F8FA),
          elevation: 0,
          foregroundColor: const Color(0xFF1F2937),
          bottom: TabBar(
            labelColor: const Color(0xFF10B981),
            unselectedLabelColor: const Color(0xFF9CA3AF),
            indicatorColor: const Color(0xFF10B981),
            labelStyle: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
            tabs: const [
              Tab(text: 'Transaksi Keluar'),
              Tab(text: 'Transaksi Masuk'),
            ],
          ),
        ),
        body: FutureBuilder<List<AlidpayTransaction>>(
          future: _futureTrx,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const ListSkeleton();
            }

            if (snapshot.hasError) {
              return Center(
                child: Text(
                  'Gagal memuat data. Tarik untuk mencoba lagi.',
                  style: TextStyle(color: Colors.grey.shade500),
                ),
              );
            }

            final allPending = (snapshot.data ?? [])
                .where((t) => t.status == AlidpayStatus.menungguKonfirmasi)
                .toList();

            // Transaksi Keluar: GW yang bikin transaksi ini, lagi nunggu lawan konfirmasi
            final trxKeluar = allPending
                .where((t) => t.createdBy == userId)
                .toList();

            // Transaksi Masuk: LAWAN yang bikin, sekarang nunggu GW konfirmasi
            final trxMasuk = allPending
                .where((t) => t.createdBy != userId)
                .toList();

            return TabBarView(
              children: [
                _buildList(
                  trxKeluar,
                  userId: userId,
                  emptyText:
                      'Tidak ada transaksi keluar\nyang menunggu konfirmasi lawan',
                  showActions: false,
                ),
                _buildList(
                  trxMasuk,
                  userId: userId,
                  emptyText:
                      'Tidak ada transaksi masuk\nyang menunggu konfirmasi kamu',
                  showActions: true,
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildList(
    List<AlidpayTransaction> trxList, {
    required String? userId,
    required String emptyText,
    required bool showActions,
  }) {
    if (trxList.isEmpty) {
      return RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.24),
            Icon(
              Icons.check_circle_outline_rounded,
              size: 48,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 12),
            Text(
              emptyText,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade500),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
        itemCount: trxList.length,
        itemBuilder: (context, index) {
          final t = trxList[index];
          final isBuyer = t.buyer.id == userId;
          final isProcessing = _processingIds.contains(t.id);
          final counterpart = isBuyer ? t.seller.name : t.buyer.name;

          // 🟢 Ambil unread count chat buat transaksi ini (bisa aja ada chat
          // walau statusnya masih menunggu konfirmasi)
          final unreadChat =
              context
                  .watch<ChatNotificationProvider>()
                  .summaries[t.id]
                  ?.unreadCount ??
              0;

          return InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => DetailScreen(
                    trx: t,
                    showChatOption: true,
                    userRole: isBuyer ? 'pembeli' : 'penjual',
                  ),
                ),
              );
              _refresh();
              if (context.mounted) {
                context.read<ChatNotificationProvider>().refreshSummaries();
              }
            },
            child: Stack(
              children: [
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFF1F1F4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: isBuyer
                              ? const Color(0xFF8B5CF6).withValues(alpha: 0.12)
                              : const Color(0xFF3B82F6).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isBuyer
                              ? 'Kamu sebagai Pembeli'
                              : 'Kamu sebagai Penjual',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: isBuyer
                                ? const Color(0xFF8B5CF6)
                                : const Color.fromARGB(255, 25, 152, 109),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        t.judulBarang,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        showActions
                            ? 'Dari $counterpart'
                            : 'Membuat transaksi ke $counterpart',
                        style: TextStyle(
                          fontSize: 12.5,
                          color: Colors.grey.shade500,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        formatRupiah(t.nominal),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (showActions)
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: isProcessing
                                    ? null
                                    : () => _tolak(t),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFFEF4444),
                                  side: const BorderSide(
                                    color: Color(0xFFEF4444),
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text('Tolak'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: isProcessing
                                    ? null
                                    : () => _konfirmasi(t),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF10B981),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: isProcessing
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text('Konfirmasi'),
                              ),
                            ),
                          ],
                        )
                      else
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF3F4F6),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              'Menunggu $counterpart konfirmasi',
                              style: const TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ),
                        ),
                      if (unreadChat > 0)
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.chat_bubble_rounded,
                                  color: Colors.white,
                                  size: 10,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  unreadChat > 9 ? '9+' : '$unreadChat',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      if (unreadChat > 0)
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.chat_bubble_rounded,
                                  color: Colors.white,
                                  size: 10,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  unreadChat > 9 ? '9+' : '$unreadChat',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
