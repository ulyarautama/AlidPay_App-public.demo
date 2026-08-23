// seller_create_alidpay_screen.dart
//
// Dua mode pembuatan transaksi:
//  1) "Pembeli Terdaftar"  -> input ID Pembeli (@ALID-xxxx)
//  2) "Belum Punya Akun"   -> generate tautan yang bisa dibagikan manual
//
// Keduanya lewat RingkasanAlidpayScreen dulu sebelum benar-benar commit
// ke server — polanya disamakan persis di kedua mode.

import 'package:client_mobile/core/network/api_endpoints.dart';
import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/screens/ringkasan_alidpay_screen.dart';
import 'package:client_mobile/services/transaction_service.dart';
import 'package:client_mobile/theme/editorial_theme.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart'; // flutter pub add share_plus

enum _CreateMode { withId, shareLink }

class SellerCreateAlidpayScreen extends StatefulWidget {
  const SellerCreateAlidpayScreen({super.key});

  @override
  State<SellerCreateAlidpayScreen> createState() =>
      _SellerCreateAlidpayScreenState();
}

class _SellerCreateAlidpayScreenState extends State<SellerCreateAlidpayScreen> {
  _CreateMode _mode = _CreateMode.withId;
  bool didCreate = false;

  // ============ MODE A: DENGAN ID PEMBELI ============

  Future<void> _openRingkasan({
    required String judul,
    required String penjual, // ID Pembeli (@ALID-...)
    required int nominal,
    required String role,
    String? kontak,
  }) async {
    _showLoadingDialog('Memuat data pembeli & detail transaksi');

    try {
      final response = await DioClient.dio.get(
        ApiEndpoints.lookupUser(penjual),
      );

      if (!mounted) return;
      Navigator.pop(context); // tutup loading

      final namaPembeliAsli = response.data['name'] as String;

      final result = await Navigator.push<String>(
        context,
        MaterialPageRoute(
          builder: (_) => RingkasanAlidpayScreen(
            judulBarang: judul,
            nominal: nominal,
            role: role,
            type: 'normal',
            lawanTransaksiName: namaPembeliAsli,
            lawanTransaksiId: penjual,
            kontakLawan: kontak,
            onConfirm:
                ({
                  required judul,
                  required nominal,
                  required lawanTransaksiId,
                  required role,
                  kontak,
                  required type,
                }) async {
                  final messenger = ScaffoldMessenger.of(context);
                  final navigator = Navigator.of(context);

                  try {
                    await TransactionService.createTransaction(
                      judul: judul,
                      nominal: nominal,
                      lawanTransaksiId: lawanTransaksiId,
                      role: role,
                      kontak: kontak,
                      type: type,
                    );

                    messenger.showSnackBar(
                      _successSnack(
                        'Transaksi berhasil dibuat! Menunggu konfirmasi lawan.',
                      ),
                    );

                    navigator.pop('success');
                  } catch (error) {
                    messenger.showSnackBar(_errorSnack('Gagal: $error'));
                  }
                },
          ),
        ),
      );

      if (result != null && mounted) {
        didCreate = true;
        Navigator.pop(context, true);
      }
    } on DioException catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // tutup loading

      final statusCode = e.response?.statusCode;
      final message = e.response?.data['message'] as String?;

      String finalMessage;
      IconData icon;
      Color color;

      if (statusCode == 404) {
        finalMessage =
            message ?? 'ID tidak ditemukan. Pastikan ID sudah benar.';
        icon = Icons.search_off_rounded;
        color = Colors.red.shade600;
      } else if (statusCode == 422) {
        finalMessage =
            message ?? 'Kamu tidak bisa bertransaksi dengan ID sendiri.';
        icon = Icons.block_rounded;
        color = Colors.orange.shade700;
      } else {
        finalMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        icon = Icons.error_outline_rounded;
        color = Colors.red.shade600;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(child: Text(finalMessage)),
            ],
          ),
          backgroundColor: color,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        ),
      );
    }
  }

  // ============ MODE B: BELUM PUNYA AKUN -> LEWAT RINGKASAN DULU ============

  Future<void> _openRingkasanShareLink({
    required String judul,
    required int nominal,
    String? kontak,
  }) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => RingkasanAlidpayScreen(
          judulBarang: judul,
          nominal: nominal,
          role: 'penjual',
          type: 'tautan',
          isShareLink: true,
          kontakLawan: kontak,
          onConfirmShareLink:
              ({
                required judul,
                required nominal,
                kontak,
                required role,
                required type,
              }) => _createShareableLink(
                judul: judul,
                nominal: nominal,
                kontak: kontak,
                role: role,
                type: type,
              ),
        ),
      ),
    );

    if (result == true && mounted) {
      didCreate = true;
      Navigator.pop(context, true);
    }
  }

  // NOTE UNTUK AURIDIA: endpoint & bentuk response {link, code} ini asumsi
  // saya — sesuaikan ke ApiEndpoints yang sebenarnya (mis. buat endpoint
  // baru `createShareableTransaction`, jangan reuse `createTransaction`
  // biasa kalau kontrak request-nya beda).
  Future<void> _createShareableLink({
    required String judul,
    required int nominal,
    String? kontak,
    required String role,
    required String type,
  }) async {
    _showLoadingDialog('Menyiapkan tautan pembayaran');

    try {
      final response = await DioClient.dio.post(
        ApiEndpoints
            .createTransaction, // todo: ganti ke endpoint shareable yang sesuai
        data: {
          'judul_barang': judul,
          'nominal': nominal,
          'kontak': kontak,
          'role': role,
          'type': type,
        },
      );

      if (!mounted) return;
      Navigator.pop(context); // tutup loading

      final webUrl = response.data['webUrl'] as String;
      final code = response.data['code'] as String;
      final shareText = response.data['share_text'] as String?;

      if (!mounted) return;
      await _showShareResultSheet(
        webUrl: webUrl,
        code: code,
        judul: judul,
        shareText: shareText,
        kontak: kontak,
        role: role,
        nominal: nominal,
      );

      // Pop ini menutup RingkasanAlidpayScreen (bukan Create screen).
      // Create screen ditutup oleh _openRingkasanShareLink setelah ini.
      if (mounted) Navigator.pop(context, true);
    } on DioException catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // tutup loading
      final message = e.response?.data['message'] as String?;
      ScaffoldMessenger.of(context).showSnackBar(
        _errorSnack(message ?? 'Gagal membuat tautan. Coba lagi.'),
      );
    }
    return;
  }

  Future<void> _showShareResultSheet({
    required String webUrl,
    required String code,
    required String judul,
    required int nominal,
    String? kontak,
    String? role,
    String? shareText,
    String? buyerName,
    String? sellerName,
  }) {
    // Format Tanggal & Rupiah (membutuhkan import 'package:intl/intl.dart')
    final String dateFormatted = DateFormat(
      'dd/MM/yyyy, HH:mm',
    ).format(DateTime.now());
    final String priceFormatted = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(nominal);

    final String finalBuyer = buyerName ?? kontak ?? 'Pelanggan';
    final String finalSeller = sellerName ?? 'Penjual';

    // Format Teks Template Resmi AlidPay
    final String textToShare =
        shareText ??
        '''
[ALIDPAY - REKBER RESMI]

Halo $finalBuyer,

Pesanan Anda telah berhasil dibuat dan menunggu konfirmasi.

🔹 Kode Transaksi  : $code
🔹 Tanggal         : $dateFormatted WIB
👤 Penjual         : $finalSeller
👤 Pembeli         : $finalBuyer
📦 Produk          : $judul
💰 Total Bayar     : $priceFormatted

Silakan lakukan pembayaran melalui halaman website resmi AlidPay:
$webUrl

Atau download aplikasi AlidPay dan pantau status:
https://play.google.com/store/apps/details?id=com.alidpay.app

Batalkan transaksi jika kamu ingin membatalkannya:
https://alidpay.com

Website resmi AlidPay:
https://alidpay.com

---
Keamanan Transaksi:
1. AlidPay TIDAK PERNAH meminta OTP, password, atau PIN via WhatsApp/Telepon
2. Pastikan website beralamat https://alidpay.com
3. Dana Anda aman sampai pesanan diterima dengan baik

Butuh bantuan? Hubungi CS AlidPay: -.
Terima kasih telah bertransaksi dengan AlidPay.
''';

    return showModalBottomSheet(
      context: context,
      isScrollControlled: false,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: EdgeInsets.fromLTRB(
            24,
            14,
            24,
            24 + MediaQuery.of(context).viewInsets.bottom,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 36,
                  height: 3,
                  decoration: BoxDecoration(
                    color: EditorialTheme.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Header Status
              Row(
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    color: EditorialTheme.successGreen,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Tautan Siap Dibagikan',
                    style: EditorialTheme.display(17, weight: FontWeight.w800),
                  ),
                ],
              ),
              if (kontak != null && kontak.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  'Untuk: $kontak',
                  style: EditorialTheme.body(
                    12,
                    color: EditorialTheme.inkPrimary.withValues(alpha: 0.5),
                  ),
                ),
              ],
              const SizedBox(height: 16),

              // Box Card: Kode & Link
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  border: Border.all(color: EditorialTheme.border),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'KODE TRANSAKSI',
                      style: EditorialTheme.body(
                        10,
                        weight: FontWeight.w800,
                        color: EditorialTheme.inkPrimary.withValues(
                          alpha: 0.45,
                        ),
                      ).copyWith(letterSpacing: 0.6),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      code,
                      style: EditorialTheme.display(
                        20,
                        weight: FontWeight.w800,
                        color: EditorialTheme.gold,
                      ).copyWith(letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 10),
                    Container(height: 1, color: EditorialTheme.border),
                    const SizedBox(height: 10),
                    Text(
                      'Website Resmi AlidPay: $webUrl',
                      style: EditorialTheme.body(12, weight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Preview Teks Pesan WA/Chat
              Text(
                'PRATINJAU PESAN',
                style: EditorialTheme.body(
                  10,
                  weight: FontWeight.w800,
                  color: EditorialTheme.inkPrimary.withValues(alpha: 0.45),
                ).copyWith(letterSpacing: 0.6),
              ),
              const SizedBox(height: 6),
              Container(
                height: 100,
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: EditorialTheme.border.withValues(alpha: 0.6),
                  ),
                ),
                child: Scrollbar(
                  child: SingleChildScrollView(
                    child: Text(
                      textToShare,
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10.5,
                        height: 1.4,
                        color: Colors.grey.shade800,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Tombol Salin Pesan & Bagikan
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        await Clipboard.setData(
                          ClipboardData(text: textToShare),
                        );
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'Pesan format resmi disalin!',
                                style: EditorialTheme.body(
                                  13,
                                  color: Colors.white,
                                ),
                              ),
                              backgroundColor: EditorialTheme.inkPrimary,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          );
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(
                          color: EditorialTheme.inkPrimary,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      child: Text(
                        'Salin Pesan',
                        style: EditorialTheme.display(
                          13,
                          weight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        SharePlus.instance.share(
                          ShareParams(text: textToShare),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: EditorialTheme.gold,
                        foregroundColor: EditorialTheme.inkPrimary,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      child: Text(
                        'Bagikan',
                        style: EditorialTheme.display(
                          13,
                          weight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
  // ============ HELPERS ============

  void _showLoadingDialog(String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Center(
        child: Container(
          width: 280,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.4,
                  color: EditorialTheme.inkPrimary,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                message,
                textAlign: TextAlign.center,
                style: EditorialTheme.body(13, weight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }

  SnackBar _successSnack(String text) => SnackBar(
    content: Text(text, style: EditorialTheme.body(13, color: Colors.white)),
    backgroundColor: EditorialTheme.inkPrimary,
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
  );

  SnackBar _errorSnack(String text) => SnackBar(
    content: Text(text, style: EditorialTheme.body(13, color: Colors.white)),
    backgroundColor: Colors.red.shade700,
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
  );

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      child: Scaffold(
        backgroundColor: EditorialTheme.bg,
        appBar: AppBar(
          backgroundColor: EditorialTheme.bg,
          elevation: 0,
          scrolledUnderElevation: 0,
          foregroundColor: EditorialTheme.inkPrimary,
          centerTitle: false,
          title: Text(
            'Buat Transaksi',
            style: EditorialTheme.display(18, weight: FontWeight.w800),
          ),
        ),
        body: Column(
          children: [
            _ModeSwitcher(
              mode: _mode,
              onChanged: (m) => setState(() => _mode = m),
            ),
            Expanded(
              child: _mode == _CreateMode.withId
                  ? _FormWithId(onSubmit: _openRingkasan)
                  : _FormShareLink(onSubmit: _openRingkasanShareLink),
            ),
          ],
        ),
      ),
    );
  }
}

// ================================================================
// SEGMENTED SWITCHER
// ================================================================

class _ModeSwitcher extends StatelessWidget {
  final _CreateMode mode;
  final ValueChanged<_CreateMode> onChanged;

  const _ModeSwitcher({required this.mode, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: EditorialTheme.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _switchTab(
              label: 'Pembeli Terdaftar',
              subtitle: 'Sudah punya ID AlidPay',
              selected: mode == _CreateMode.withId,
              onTap: () => onChanged(_CreateMode.withId),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _switchTab(
              label: 'Pembeli belum Punya Akun',
              subtitle: 'Kirim tautan pembayaran',
              selected: mode == _CreateMode.shareLink,
              onTap: () => onChanged(_CreateMode.shareLink),
            ),
          ),
        ],
      ),
    );
  }

  Widget _switchTab({
    required String label,
    required String subtitle,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: EditorialTheme.display(
                14,
                weight: selected ? FontWeight.w800 : FontWeight.w600,
                color: selected
                    ? EditorialTheme.inkPrimary
                    : EditorialTheme.inkPrimary.withValues(alpha: 0.4),
              ),
            ),
            const SizedBox(height: 3),
            Text(
              subtitle,
              style: EditorialTheme.body(
                11,
                color: EditorialTheme.inkPrimary.withValues(alpha: 0.4),
              ),
            ),
            const SizedBox(height: 10),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 2,
              color: selected ? EditorialTheme.gold : Colors.transparent,
            ),
          ],
        ),
      ),
    );
  }
}

// ================================================================
// FORM A: DENGAN ID PEMBELI
// ================================================================

class _FormWithId extends StatefulWidget {
  final Future<void> Function({
    required String judul,
    required String penjual,
    required int nominal,
    String? kontak,
    required String role,
  })
  onSubmit;

  const _FormWithId({required this.onSubmit});

  @override
  State<_FormWithId> createState() => _FormWithIdState();
}

class _FormWithIdState extends State<_FormWithId> {
  final _formKey = GlobalKey<FormState>();
  final _judulController = TextEditingController();
  final _idController = TextEditingController();
  final _kontakController = TextEditingController();
  final _nominalController = TextEditingController();

  @override
  void dispose() {
    _judulController.dispose();
    _idController.dispose();
    _kontakController.dispose();
    _nominalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionLabel('BARANG / JASA'),
            _underlineField(
              controller: _judulController,
              hint: 'Contoh: iPhone 15 Pro — 256GB',
              validator: _req,
            ),
            const SizedBox(height: 28),

            _sectionLabel('ID PEMBELI'),
            _underlineField(
              controller: _idController,
              hint: '@ALID-8K4M2P9X',
              validator: _req,
            ),
            const SizedBox(height: 6),
            Text(
              'Minta pembeli membagikan ID dari halaman profilnya.',
              style: EditorialTheme.body(
                11,
                color: EditorialTheme.inkPrimary.withValues(alpha: 0.45),
              ),
            ),
            const SizedBox(height: 28),

            _sectionLabel('KONTAK PEMBELI (OPSIONAL)'),
            _underlineField(
              controller: _kontakController,
              hint: 'No. HP atau nama panggilan',
            ),
            const SizedBox(height: 32),

            _nominalField(_nominalController),

            const SizedBox(height: 40),
            _submitButton(
              label: 'Lanjut ke Ringkasan',
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  final clean = _nominalController.text.trim().replaceAll(
                    '.',
                    '',
                  );
                  widget.onSubmit(
                    judul: _judulController.text.trim(),
                    penjual: _idController.text.trim(),
                    nominal: int.parse(clean),
                    kontak: _kontakController.text.trim().isEmpty
                        ? null
                        : _kontakController.text.trim(),
                    role: 'penjual',
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  String? _req(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Wajib diisi' : null;
}

// ================================================================
// FORM B: BELUM PUNYA AKUN — GENERATE TAUTAN
// ================================================================

class _FormShareLink extends StatefulWidget {
  final Future<void> Function({
    required String judul,
    required int nominal,
    String? kontak,
  })
  onSubmit;

  const _FormShareLink({required this.onSubmit});

  @override
  State<_FormShareLink> createState() => _FormShareLinkState();
}

class _FormShareLinkState extends State<_FormShareLink> {
  final _formKey = GlobalKey<FormState>();
  final _judulController = TextEditingController();
  final _kontakController = TextEditingController();
  final _nominalController = TextEditingController();

  @override
  void dispose() {
    _judulController.dispose();
    _kontakController.dispose();
    _nominalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.only(left: 14),
              decoration: const BoxDecoration(
                border: Border(
                  left: BorderSide(color: EditorialTheme.gold, width: 3),
                ),
              ),
              child: Text(
                'Pembeli belum perlu install AlidPay. Setelah kamu buat, '
                'kamu akan dapat tautan untuk dikirim lewat WhatsApp atau SMS. '
                'Saat dibuka, pembeli membuat akun singkat dan otomatis '
                'terhubung ke transaksi ini.',
                style: EditorialTheme.body(
                  13,
                  color: EditorialTheme.inkPrimary.withValues(alpha: 0.75),
                ).copyWith(height: 1.5, fontStyle: FontStyle.italic),
              ),
            ),
            const SizedBox(height: 32),

            _sectionLabel('BARANG / JASA'),
            _underlineField(
              controller: _judulController,
              hint: 'Contoh: Jasa desain logo',
              validator: _req,
            ),
            const SizedBox(height: 28),

            _sectionLabel('KONTAK PEMBELI (OPSIONAL)'),
            _underlineField(
              controller: _kontakController,
              hint: 'No. HP atau nama panggilan',
            ),
            const SizedBox(height: 32),

            _nominalField(_nominalController),

            const SizedBox(height: 40),
            _submitButton(
              label: 'Buat Tautan Pembayaran',
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  final clean = _nominalController.text.trim().replaceAll(
                    '.',
                    '',
                  );
                  widget.onSubmit(
                    judul: _judulController.text.trim(),
                    nominal: int.parse(clean),
                    kontak: _kontakController.text.trim().isEmpty
                        ? null
                        : _kontakController.text.trim(),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  String? _req(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Wajib diisi' : null;
}

// ================================================================
// SHARED FIELD WIDGETS
// ================================================================

Widget _sectionLabel(String text) => Padding(
  padding: const EdgeInsets.only(bottom: 10),
  child: Text(
    text,
    style: EditorialTheme.body(
      11,
      weight: FontWeight.w800,
      color: EditorialTheme.inkPrimary.withValues(alpha: 0.55),
    ).copyWith(letterSpacing: 0.6),
  ),
);

Widget _underlineField({
  required TextEditingController controller,
  required String hint,
  String? Function(String?)? validator,
  TextInputType? keyboardType,
  List<TextInputFormatter>? inputFormatters,
}) {
  return TextFormField(
    controller: controller,
    validator: validator,
    keyboardType: keyboardType,
    inputFormatters: inputFormatters,
    style: EditorialTheme.display(16, weight: FontWeight.w600),
    cursorColor: EditorialTheme.gold,
    decoration: InputDecoration(
      hintText: hint,
      hintStyle: EditorialTheme.body(
        14,
        color: EditorialTheme.inkPrimary.withValues(alpha: 0.28),
      ),
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(vertical: 10),
      border: const UnderlineInputBorder(
        borderSide: BorderSide(color: EditorialTheme.border, width: 1),
      ),
      enabledBorder: const UnderlineInputBorder(
        borderSide: BorderSide(color: EditorialTheme.border, width: 1),
      ),
      focusedBorder: const UnderlineInputBorder(
        borderSide: BorderSide(color: EditorialTheme.gold, width: 2),
      ),
      errorBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: Colors.red.shade400, width: 1),
      ),
      focusedErrorBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: Colors.red.shade400, width: 2),
      ),
    ),
  );
}

Widget _nominalField(TextEditingController controller) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel('NOMINAL HARGA'),
      Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 10, right: 6),
            child: Text(
              'Rp',
              style: EditorialTheme.display(
                20,
                weight: FontWeight.w700,
                color: EditorialTheme.gold,
              ),
            ),
          ),
          Expanded(
            child: TextFormField(
              controller: controller,
              keyboardType: TextInputType.number,
              inputFormatters: [RupiahInputFormatter()],
              validator: _reqNominal,
              style: EditorialTheme.display(28, weight: FontWeight.w800),
              cursorColor: EditorialTheme.gold,
              decoration: InputDecoration(
                hintText: '0',
                hintStyle: EditorialTheme.display(
                  28,
                  weight: FontWeight.w800,
                  color: EditorialTheme.inkPrimary.withValues(alpha: 0.2),
                ),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 6),
                border: const UnderlineInputBorder(
                  borderSide: BorderSide(color: EditorialTheme.border),
                ),
                enabledBorder: const UnderlineInputBorder(
                  borderSide: BorderSide(color: EditorialTheme.border),
                ),
                focusedBorder: const UnderlineInputBorder(
                  borderSide: BorderSide(color: EditorialTheme.gold, width: 2),
                ),
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

String? _reqNominal(String? v) {
  if (v == null || v.trim().isEmpty) return 'Wajib diisi';
  final clean = v.trim().replaceAll('.', '');
  final parsed = int.tryParse(clean);
  if (parsed == null) return 'Harus berupa angka';
  if (parsed <= 0) return 'Nominal harus lebih dari 0';
  return null;
}

Widget _submitButton({required String label, required VoidCallback onPressed}) {
  return SizedBox(
    width: double.infinity,
    child: ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: EditorialTheme.inkPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
      ),
      child: Text(
        label,
        style: EditorialTheme.display(
          14,
          weight: FontWeight.w700,
          color: Colors.white,
        ).copyWith(letterSpacing: 0.4),
      ),
    ),
  );
}

// ================================================================
// HASIL: BOTTOM SHEET TAUTAN
// ================================================================

// class _ShareResultSheet extends StatelessWidget {
//   final String link;
//   final String code;
//   final String judul;

//   const _ShareResultSheet({
//     required this.link,
//     required this.code,
//     required this.judul,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return Container(
//       padding: EdgeInsets.fromLTRB(
//         24,
//         14,
//         24,
//         24 + MediaQuery.of(context).viewInsets.bottom,
//       ),
//       decoration: const BoxDecoration(
//         color: Colors.white,
//         borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
//       ),
//       child: Column(
//         mainAxisSize: MainAxisSize.min,
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           Center(
//             child: Container(
//               width: 36,
//               height: 3,
//               decoration: BoxDecoration(
//                 color: EditorialTheme.border,
//                 borderRadius: BorderRadius.circular(2),
//               ),
//             ),
//           ),
//           const SizedBox(height: 20),
//           Row(
//             children: [
//               const Icon(
//                 Icons.check_circle_rounded,
//                 color: EditorialTheme.successGreen,
//                 size: 20,
//               ),
//               const SizedBox(width: 8),
//               Text(
//                 'Tautan Siap Dibagikan',
//                 style: EditorialTheme.display(17, weight: FontWeight.w800),
//               ),
//             ],
//           ),
//           const SizedBox(height: 4),
//           Text(
//             'Untuk: $judul',
//             style: EditorialTheme.body(
//               12,
//               color: EditorialTheme.inkPrimary.withValues(alpha: 0.5),
//             ),
//           ),
//           const SizedBox(height: 24),
//           Container(
//             width: double.infinity,
//             padding: const EdgeInsets.all(16),
//             decoration: BoxDecoration(
//               border: Border.all(color: EditorialTheme.border),
//               borderRadius: BorderRadius.circular(4),
//             ),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Text(
//                   'KODE TRANSAKSI',
//                   style: EditorialTheme.body(
//                     10,
//                     weight: FontWeight.w800,
//                     color: EditorialTheme.inkPrimary.withValues(alpha: 0.45),
//                   ).copyWith(letterSpacing: 0.6),
//                 ),
//                 const SizedBox(height: 6),
//                 Text(
//                   code,
//                   style: EditorialTheme.display(
//                     22,
//                     weight: FontWeight.w800,
//                     color: EditorialTheme.gold,
//                   ).copyWith(letterSpacing: 1.2),
//                 ),
//                 const SizedBox(height: 14),
//                 Container(height: 1, color: EditorialTheme.border),
//                 const SizedBox(height: 14),
//                 Text(
//                   link,
//                   style: EditorialTheme.body(13, weight: FontWeight.w600),
//                 ),
//               ],
//             ),
//           ),
//           const SizedBox(height: 20),
//           Row(
//             children: [
//               Expanded(
//                 child: OutlinedButton(
//                   onPressed: () async {
//                     await Clipboard.setData(ClipboardData(text: link));
//                     if (context.mounted) {
//                       ScaffoldMessenger.of(context).showSnackBar(
//                         SnackBar(
//                           content: Text(
//                             'Tautan disalin',
//                             style: EditorialTheme.body(13, color: Colors.white),
//                           ),
//                           backgroundColor: EditorialTheme.inkPrimary,
//                           behavior: SnackBarBehavior.floating,
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(4),
//                           ),
//                         ),
//                       );
//                     }
//                   },
//                   style: OutlinedButton.styleFrom(
//                     side: const BorderSide(color: EditorialTheme.inkPrimary),
//                     padding: const EdgeInsets.symmetric(vertical: 16),
//                     shape: RoundedRectangleBorder(
//                       borderRadius: BorderRadius.circular(4),
//                     ),
//                   ),
//                   child: Text(
//                     'Salin Tautan',
//                     style: EditorialTheme.display(13, weight: FontWeight.w700),
//                   ),
//                 ),
//               ),
//               const SizedBox(width: 12),
//               Expanded(
//                 child: ElevatedButton(
//                   onPressed: () {
//                     Share.share(
//                       'Halo! Saya mengirim transaksi lewat AlidPay untuk '
//                       '"$judul". Buka tautan ini untuk melanjutkan: $link',
//                     );
//                   },
//                   style: ElevatedButton.styleFrom(
//                     backgroundColor: EditorialTheme.gold,
//                     foregroundColor: EditorialTheme.inkPrimary,
//                     elevation: 0,
//                     padding: const EdgeInsets.symmetric(vertical: 16),
//                     shape: RoundedRectangleBorder(
//                       borderRadius: BorderRadius.circular(4),
//                     ),
//                   ),
//                   child: Text(
//                     'Bagikan',
//                     style: EditorialTheme.display(13, weight: FontWeight.w800),
//                   ),
//                 ),
//               ),
//             ],
//           ),
//         ],
//       ),
//     );
//   }
// }

// ================================================================
// FORMATTER RUPIAH
// ================================================================

class RupiahInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) return newValue.copyWith(text: '');

    final digitsOnly = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (digitsOnly.isEmpty) return newValue.copyWith(text: '');

    final formatted = _formatWithDots(digitsOnly);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  String _formatWithDots(String digits) {
    final buffer = StringBuffer();
    final reversed = digits.split('').reversed.toList();
    for (int i = 0; i < reversed.length; i++) {
      if (i != 0 && i % 3 == 0) buffer.write('.');
      buffer.write(reversed[i]);
    }
    return buffer.toString().split('').reversed.join('');
  }
}
