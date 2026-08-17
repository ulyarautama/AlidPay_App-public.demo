import 'package:client_mobile/core/storage/token_storage.dart';
import 'package:client_mobile/screens/chat_screen.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
// import 'package:url_launcher/url_launcher.dart';
import '../models/transaction.dart';
import '../widgets/formatters.dart';
import '../widgets/share_transaction_sheet.dart';
import '../services/transaction_service.dart';
import 'package:client_mobile/screens/create_dispute_screen.dart';

class DetailScreen extends StatefulWidget {
  final AlidpayTransaction trx;
  final bool showChatOption;
  final String?
  userRole; // 👈 1. Tambahkan role user saat ini ('pembeli' atau 'penjual')

  const DetailScreen({
    super.key,
    required this.trx,
    this.showChatOption = false,
    this.userRole, // 👈 Wajib diisi saat pindah halaman
  });

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  late AlidpayTransaction trx;
  bool _isLoading = false;

  bool get _isSellerInitiated => trx.createdBy == trx.seller.id;

  String get _missingPartyLabel =>
      _isSellerInitiated ? 'Menunggu Pembeli' : 'Menunggu Penjual';

  String get _confirmerLabel => _isSellerInitiated ? 'Pembeli' : 'Penjual';

  String get _statusBadgeText {
    if (trx.status == AlidpayStatus.draftLink) {
      return 'Menunggu Pembayaran - $_missingPartyLabel';
    }
    return trx.status.label;
  }

  List<String> get _timelineSteps {
    final baseSteps = [
      '$_confirmerLabel Konfirmasi Transaksi Masuk',
      'Pembeli Bayar',
      'Dana Diamankan',
      'Penjual Kirim',
      'Pembeli Konfirmasi Terima Dengan Baik',
      'Dana Dicairkan ke Penjual',
    ];

    if (trx.type == 'tautan') {
      return [_missingPartyLabel, ...baseSteps];
    }
    return baseSteps;
  }

  @override
  void initState() {
    super.initState();
    trx = widget.trx;
  }

  Future<void> _refresh() async {
    setState(() => _isLoading = true);

    try {
      final updated = await TransactionService.getDetailTransactions(trx.id);

      if (!mounted) return;

      setState(() {
        trx = updated;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  int get activeStep {
    final offset = trx.type == 'tautan' ? 1 : 0;

    switch (trx.status) {
      case AlidpayStatus.draftLink:
        return 0; // pas di step "Menunggu Pembeli/Penjual"
      case AlidpayStatus.menungguKonfirmasi:
        return 0 + offset;
      case AlidpayStatus.menungguPembayaran:
        return 1 + offset;
      case AlidpayStatus.danaDitahan:
        return 2 + offset;
      case AlidpayStatus.barangDikirim:
        return 4 + offset;
      case AlidpayStatus.danaDicairkan:
        return 5 + offset;
      case AlidpayStatus.sengketa:
      case AlidpayStatus.dibatalkan:
        return 1 + offset;
    }
  }

  Future<void> _runAction(
    Future<void> Function() action, {
    required String successMessage,
    bool popOnSuccess = true,
  }) async {
    setState(() => _isLoading = true);
    try {
      await action();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(successMessage),
          backgroundColor: const Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      if (popOnSuccess && mounted) {
        Navigator.pop(context, true);
      }
    } on DioException catch (e) {
      if (!mounted) return;
      final message =
          e.response?.data['message'] as String? ??
          'Gagal memproses. Coba lagi.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red.shade600,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: Colors.red.shade600,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  bool _showChatIcon(AlidpayStatus status) {
    return status == AlidpayStatus.menungguKonfirmasi ||
        status == AlidpayStatus.menungguPembayaran ||
        status == AlidpayStatus.danaDitahan ||
        status == AlidpayStatus.barangDikirim ||
        status == AlidpayStatus.danaDicairkan;
  }

  @override
  Widget build(BuildContext context) {
    final color = statusColor(trx.status);
    // Cek role untuk mempermudah logika tombol
    final isPembeli = widget.userRole?.toLowerCase() == 'pembeli';
    final isPenjual = widget.userRole?.toLowerCase() == 'penjual';

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Detail Transaksi',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
            ),
            InkWell(
              onTap: () async {
                await Clipboard.setData(ClipboardData(text: trx.id));
                if (!context.mounted) return;
                final overlay = Overlay.of(context);
                late OverlayEntry overlayEntry;
                overlayEntry = OverlayEntry(
                  builder: (context) => Positioned(
                    top: MediaQuery.of(context).size.height * 0.45,
                    left: MediaQuery.of(context).size.width * 0.1,
                    right: MediaQuery.of(context).size.width * 0.1,
                    child: Center(
                      child: Material(
                        color: Colors.transparent,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.12),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.check_circle_rounded,
                                color: Color(0xFF10B981),
                                size: 18,
                              ),
                              SizedBox(width: 8),
                              Text(
                                'ID Transaksi Berhasil Disalin',
                                style: TextStyle(
                                  color: Color(0xFF1F2937),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
                overlay.insert(overlayEntry);
                Future.delayed(const Duration(milliseconds: 1200), () {
                  overlayEntry.remove();
                });
              },
              borderRadius: BorderRadius.circular(4),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // 👈 Bungkus dengan Expanded/Flexible agar teks mengalah pada sisa ruang
                    Flexible(
                      child: Text(
                        trx.id,
                        overflow: TextOverflow
                            .ellipsis, // 👈 Potong dengan '...' jika overflow
                        maxLines: 1,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Icon(
                      Icons.copy_rounded,
                      size: 14,
                      color: Color(0xFF9CA3AF),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.ios_share_rounded),
            tooltip: 'Bagikan Transaksi',
            onPressed: () => ShareTransactionSheet.show(context, trx),
          ),
          if (widget.showChatOption && _showChatIcon(trx.status))
            IconButton(
              icon: const Icon(Icons.chat_bubble_rounded),
              tooltip: 'Chat',
              onPressed: () async {
                final currentUserId = await TokenStorage.getUserId();
                debugPrint(
                  'CHAT DEBUG: currentUserId = $currentUserId',
                ); // 👈 tambahin ini
                if (currentUserId == null || !context.mounted) {
                  debugPrint(
                    'CHAT DEBUG: dibatalkan, userId null atau context unmounted',
                  );
                  return;
                }

                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ChatScreen(
                      transactionId: trx.id,
                      currentUserRole: widget.userRole ?? '',
                      currentUserId: currentUserId,
                      lawanBicaraName: isPembeli ? trx.penjual : trx.pembeli,
                    ),
                  ),
                );
              },
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            // Header Card (Nominal info)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _statusBadgeText,
                      style: TextStyle(
                        color: color,
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    trx.judulBarang,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _row('Nominal Barang', formatRupiah(trx.nominal)),
                  const SizedBox(height: 8),
                  _row(
                    'Biaya Pelayanan (0.5%)',
                    formatRupiah(trx.feeAlidpay),
                    valueColor: const Color(0xFFEF4444),
                  ),
                  const SizedBox(height: 8),
                  _row(
                    'Diterima Penjual',
                    formatRupiah(trx.totalDiterimaPenjual),
                    valueColor: const Color(0xFF10B981),
                    bold: true,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Pihak Terkait Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _pihak(
                      'Penjual',
                      trx.penjual,
                      Icons.storefront_rounded,
                      const Color(0xFF3B82F6),
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 40,
                    color: const Color(0xFFF1F1F4),
                  ),
                  Expanded(
                    child: _pihak(
                      'Pembeli',
                      trx.pembeli,
                      Icons.person_rounded,
                      const Color(0xFF8B5CF6),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Timeline Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Progress Transaksi',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 16),
                  for (int i = 0; i < _timelineSteps.length; i++)
                    _timelineStep(i),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ==================== HAK AKSES TOMBOL (FIXED) ====================

            // 1. TANDAI BARANG DIKIRIM (Hanya Hak Penjual)
            if (trx.status == AlidpayStatus.danaDitahan && isPenjual)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isLoading
                      ? null
                      : () => _runAction(
                          () => TransactionService.markShipped(trx.id),
                          successMessage:
                              'Barang berhasil ditandai sudah dikirim.',
                        ),
                  icon: _isLoading
                      ? _loadingIndicator()
                      : const Icon(Icons.local_shipping_rounded),
                  label: Text(
                    _isLoading ? 'Memproses...' : 'Tandai Barang Sudah Dikirim',
                  ),
                  style: _buttonStyle(const Color(0xFF10B981)),
                ),
              ),

            // 2. KONFIRMASI TERIMA & CAIRKAN (Hanya Hak Pembeli)
            if (trx.status == AlidpayStatus.barangDikirim && isPembeli) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isLoading
                      ? null
                      : () => _runAction(
                          () => TransactionService.confirmReceived(trx.id),
                          successMessage: 'Dana berhasil dicairkan ke penjual.',
                        ),
                  icon: _isLoading
                      ? _loadingIndicator()
                      : const Icon(Icons.check_circle_rounded),
                  label: Text(
                    _isLoading
                        ? 'Memproses...'
                        : 'Konfirmasi Terima & Cairkan Dana',
                  ),
                  style: _buttonStyle(const Color(0xFF10B981)),
                ),
              ),

              const SizedBox(height: 10),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isLoading
                      ? null
                      : () async {
                          final result = await Navigator.push<bool>(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CreateDisputeScreen(trx: trx, userRole: widget.userRole ?? '',
                              ),
                            ),
                          );

                          if (result == true && mounted) {
                            await _refresh();
                          }
                        },
                  icon: const Icon(Icons.report_problem_rounded),
                  label: const Text('Ada Masalah? Ajukan Dispute'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFEF4444),
                    side: const BorderSide(
                      color: Color(0xFFEF4444),
                      width: 1.5,
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                )
              ),
            ],

            // 3. BAYAR SEKARANG (Hanya Hak Pembeli) — VERSI SIMPLE
            // (belum pakai payment gateway, tinggal update status transaksi)
            if (trx.status == AlidpayStatus.menungguPembayaran && isPembeli)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isLoading
                      ? null
                      : () => _runAction(
                          () => TransactionService.markAsPaidSimple(trx.id),
                          successMessage: 'Pembayaran berhasil dikonfirmasi.',
                        ),
                  icon: _isLoading
                      ? _loadingIndicator()
                      : const Icon(Icons.payment_rounded),
                  label: Text(_isLoading ? 'Memproses...' : 'Bayar Sekarang'),
                  style: _buttonStyle(const Color(0xFF3B82F6)),
                ),
              ),

            // ============================================================
            // 🔒 MIDTRANS PAYMENT GATEWAY — DISIMPAN, JANGAN DIHAPUS.
            // Kalau mau pasang payment gateway lagi nanti:
            // 1. Hapus/comment blok "VERSI SIMPLE" di atas.
            // 2. Uncomment fungsi _bayarViaMidtrans() di bagian bawah file ini.
            // 3. Ganti pemanggilan TransactionService.markAsPaidSimple(trx.id)
            //    di atas jadi _bayarViaMidtrans().
            // ============================================================

            // 4. HUBUNGI MEDIATOR (Bisa diakses kedua belah pihak jika Sengketa)
            if (trx.status == AlidpayStatus.sengketa)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.support_agent_rounded),
                  label: const Text('Hubungi Admin / Mediator'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFEF4444),
                    side: const BorderSide(
                      color: Color(0xFFEF4444),
                      width: 1.5,
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),

            // PESAN MENUNGGU (Jika peran user tidak sesuai dengan aksi status saat ini)
            if (trx.status == AlidpayStatus.menungguPembayaran && isPenjual)
              _buildWaitingCard("Menunggu pembeli melakukan pembayaran dana."),

            if (trx.status == AlidpayStatus.danaDitahan && isPembeli)
              _buildWaitingCard(
                "Pembayaran berhasil diamankan. Menunggu penjual mengirim transaksi ini",
              ),

            if (trx.status == AlidpayStatus.barangDikirim && isPenjual)
              _buildWaitingCard(
                "Barang sedang dikirim. Menunggu konfirmasi penerimaan dari pembeli.",
              ),
          ],
        ),
      ),
    );
  }

  // --- Helper Widgets & Styles ---

  Widget _row(
    String label,
    String value, {
    Color? valueColor,
    bool bold = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13),
        ),
        Text(
          value,
          style: TextStyle(
            color: valueColor ?? const Color(0xFF1F2937),
            fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
            fontSize: 13.5,
          ),
        ),
      ],
    );
  }

  Widget _pihak(String role, String name, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                role,
                style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
              ),
              Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1F2937),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _timelineStep(int index) {
    final isCancelled = trx.status == AlidpayStatus.dibatalkan;
    final isSengketa = trx.status == AlidpayStatus.sengketa;

    final done = index < activeStep;
    final current = index == activeStep;

    // Warnai merah jika transaksi bermasalah di step berjalan
    Color color = done || current
        ? const Color(0xFF10B981)
        : const Color(0xFFD1D5DB);
    if (current && (isCancelled || isSengketa)) {
      color = const Color(0xFFEF4444);
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: done ? color : Colors.white,
                  border: Border.all(color: color, width: 2),
                  shape: BoxShape.circle,
                ),
                child: done
                    ? const Icon(Icons.check, size: 14, color: Colors.white)
                    : current
                    ? Center(
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: color,
                            shape: BoxShape.circle,
                          ),
                        ),
                      )
                    : null,
              ),
              if (index != _timelineSteps.length - 1)
                Container(
                  width: 2,
                  height: 30,
                  color: index < activeStep ? color : const Color(0xFFE5E7EB),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                _timelineSteps[index] + // ⬅️ ganti dari steps[index]
                    (current && isSengketa
                        ? ' (Sengketa)'
                        : current && isCancelled
                        ? ' (Dibatalkan)'
                        : ''),
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: current ? FontWeight.w700 : FontWeight.w500,
                  color: current && (isSengketa || isCancelled)
                      ? const Color(0xFFEF4444)
                      : done || current
                      ? const Color(0xFF1F2937)
                      : const Color(0xFF9CA3AF),
                  decoration: isCancelled && index >= activeStep
                      ? TextDecoration.lineThrough
                      : null,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _loadingIndicator() {
    return const SizedBox(
      width: 16,
      height: 16,
      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
    );
  }

  ButtonStyle _buttonStyle(Color bg) {
    return ElevatedButton.styleFrom(
      backgroundColor: bg,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    );
  }

  Widget _buildWaitingCard(String text) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.info_outline_rounded,
            color: Color(0xFF6B7280),
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: Color(0xFF4B5563),
                fontSize: 12.5,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // 🔒 MIDTRANS PAYMENT GATEWAY — DISIMPAN, JANGAN DIHAPUS
  // Uncomment fungsi ini + panggil di tombol "Bayar Sekarang" kalau
  // mau pasang payment gateway beneran nanti.
  // ============================================================
  //
  // Future<void> _bayarViaMidtrans() async {
  //   final paymentData = await TransactionService.confirmPayment(
  //     trx.id,
  //     amount: trx.nominal,
  //   );
  //
  //   final String? paymentUrl = paymentData['payment_url']?.toString();
  //
  //   if (paymentUrl == null || paymentUrl.isEmpty) {
  //     throw Exception('Gagal mendapatkan link pembayaran dari server.');
  //   }
  //
  //   final Uri url = Uri.parse(paymentUrl);
  //
  //   if (await canLaunchUrl(url)) {
  //     await launchUrl(url, mode: LaunchMode.externalApplication);
  //   } else {
  //     throw Exception(
  //       'Tidak dapat membuka URL pembayaran langsung. Coba buka link dari notifikasi atau copy URL manual.',
  //     );
  //   }
  // }
}
