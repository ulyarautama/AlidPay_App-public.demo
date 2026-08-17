import 'package:flutter/material.dart';
import '../models/transaction.dart';
import '../widgets/formatters.dart';
import 'detail_screen.dart';

/// Halaman Riwayat Transaksi ala GoPay - dikelompokkan per tanggal
/// (Hari Ini / Kemarin / tanggal spesifik), dipakai bareng oleh
/// SellerDashboard & BuyerDashboard.
class RiwayatScreen extends StatefulWidget {
  final List<AlidpayTransaction> transactions;
  final String? userId;
  final Color accentColor;
  final String title;
  final bool startWithSelesai;

  const RiwayatScreen({
    super.key,
    required this.transactions,
    required this.userId,
    this.accentColor = const Color(0xFF10B981),
    this.title = 'Riwayat Transaksi',
    this.startWithSelesai = false,
  });

  @override
  State<RiwayatScreen> createState() => _RiwayatScreenState();
}

enum _RiwayatFilter { semua, selesai }

class _RiwayatScreenState extends State<RiwayatScreen> {
  late _RiwayatFilter _filter;

  @override
  void initState() {
    super.initState();
    _filter = widget.startWithSelesai
        ? _RiwayatFilter.selesai
        : _RiwayatFilter.semua;
  }

  static const List<String> _bulanIndo = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  String _groupLabel(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(date.year, date.month, date.day);
    final diff = today.difference(target).inDays;

    if (diff == 0) return 'Hari Ini';
    if (diff == 1) return 'Kemarin';
    return '${date.day} ${_bulanIndo[date.month]} ${date.year}';
  }

  String _jam(DateTime date) {
    final h = date.hour.toString().padLeft(2, '0');
    final m = date.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  // Icon + warna bulat kiri, mengikuti status transaksi
  (IconData, Color, Color) _statusVisual(AlidpayStatus status) {
    switch (status) {
      case AlidpayStatus.draftLink: // ⬅️ TAMBAH
        return (
          Icons.link_rounded,
          const Color(0xFF9CA3AF),
          const Color(0xFFF3F4F6),
        );
      case AlidpayStatus.danaDicairkan:
        return (
          Icons.check_circle_rounded,
          const Color(0xFF10B981),
          const Color(0xFFECFDF5),
        );
      case AlidpayStatus.dibatalkan:
        return (
          Icons.close_rounded,
          const Color(0xFFEF4444),
          const Color(0xFFFEF2F2),
        );
      case AlidpayStatus.sengketa:
        return (
          Icons.report_rounded,
          const Color(0xFFF59E0B),
          const Color(0xFFFFFBEB),
        );
      case AlidpayStatus.menungguPembayaran:
        return (
          Icons.hourglass_top_rounded,
          const Color(0xFFF97316),
          const Color(0xFFFFF7ED),
        );
      case AlidpayStatus.danaDitahan:
        return (
          Icons.lock_clock_rounded,
          const Color(0xFF3B82F6),
          const Color(0xFFEFF6FF),
        );
      case AlidpayStatus.barangDikirim:
        return (
          Icons.local_shipping_rounded,
          const Color(0xFF8B5CF6),
          const Color(0xFFF5F3FF),
        );
      case AlidpayStatus.menungguKonfirmasi:
        return (
          Icons.hourglass_empty_rounded,
          const Color(0xFF9CA3AF),
          const Color(0xFFF3F4F6),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Filter dulu sesuai tab yang aktif
    final filteredByTab = _filter == _RiwayatFilter.selesai
        ? widget.transactions
              .where((t) => t.status == AlidpayStatus.danaDicairkan)
              .toList()
        : widget.transactions;

    // Urutkan terbaru dulu
    final sorted = [...filteredByTab]
      ..sort((a, b) => b.tanggal.compareTo(a.tanggal));

    // Kelompokkan per label tanggal, urutan kemunculan tetap terjaga
    final Map<String, List<AlidpayTransaction>> grouped = {};
    for (final t in sorted) {
      final label = _groupLabel(t.tanggal);
      grouped.putIfAbsent(label, () => []).add(t);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.title,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
            ),
            const SizedBox(height: 2),
            Text(
              _filter == _RiwayatFilter.selesai
                  ? 'Transaksi Selesai'
                  : 'Total Transaksi',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w400,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFFF7F8FA),
        surfaceTintColor: const Color(0xFFF7F8FA),
        elevation: 0,
        centerTitle: false,
        foregroundColor: const Color(0xFF1F2937),
      ),
      body: Column(
        children: [
          Expanded(
            child: sorted.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.receipt_long_rounded,
                          size: 46,
                          color: Colors.grey.shade300,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Belum ada riwayat transaksi',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(18, 8, 18, 24),
                    itemCount: grouped.length,
                    itemBuilder: (context, groupIndex) {
                      final label = grouped.keys.elementAt(groupIndex);
                      final items = grouped[label]!;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(top: 16, bottom: 8),
                            child: Text(
                              label,
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: Colors.grey.shade500,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: const Color(0xFFF1F1F4),
                              ),
                            ),
                            child: Column(
                              children: List.generate(items.length, (i) {
                                final t = items[i];
                                final isBuyer = t.buyer.id == widget.userId;
                                final counterpart = isBuyer
                                    ? t.seller.name
                                    : t.buyer.name;
                                final (icon, iconColor, iconBg) = _statusVisual(
                                  t.status,
                                );

                                // Duit "masuk" buat seller pas dana dicairkan,
                                // sisanya netral abu-abu
                                final isMasuk =
                                    !isBuyer &&
                                    t.status == AlidpayStatus.danaDicairkan;
                                final isBatal =
                                    t.status == AlidpayStatus.dibatalkan;

                                final amountColor = isBatal
                                    ? Colors.grey.shade400
                                    : isMasuk
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFF1F2937);

                                final amountValue = isBuyer
                                    ? (t.nominal + t.feeAlidpay)
                                    : t.totalDiterimaPenjual;

                                final amountPrefix = isBatal
                                    ? ''
                                    : isMasuk
                                    ? '+ '
                                    : isBuyer
                                    ? '- '
                                    : '';

                                return InkWell(
                                  onTap: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => DetailScreen(trx: t),
                                      ),
                                    );
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                      vertical: 12,
                                    ),
                                    decoration: BoxDecoration(
                                      border: i == items.length - 1
                                          ? null
                                          : const Border(
                                              bottom: BorderSide(
                                                color: Color(0xFFF1F1F4),
                                              ),
                                            ),
                                    ),
                                    child: Row(
                                      children: [
                                        Container(
                                          width: 40,
                                          height: 40,
                                          decoration: BoxDecoration(
                                            color: iconBg,
                                            shape: BoxShape.circle,
                                          ),
                                          child: Icon(
                                            icon,
                                            color: iconColor,
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                t.judulBarang,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  fontSize: 13.5,
                                                  fontWeight: FontWeight.w700,
                                                  color: Color(0xFF1F2937),
                                                ),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                '${t.status.label} · $counterpart',
                                                style: TextStyle(
                                                  fontSize: 11.5,
                                                  color: Colors.grey.shade500,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.end,
                                          children: [
                                            Text(
                                              '$amountPrefix${formatRupiah(amountValue)}',
                                              style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w800,
                                                color: amountColor,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              _jam(t.tanggal),
                                              style: TextStyle(
                                                fontSize: 11,
                                                color: Colors.grey.shade400,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
