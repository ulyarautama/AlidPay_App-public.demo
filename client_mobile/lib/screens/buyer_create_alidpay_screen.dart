import 'package:client_mobile/core/network/api_endpoints.dart';
import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/screens/ringkasan_alidpay_screen.dart';
import 'package:client_mobile/services/transaction_service.dart';
import 'package:client_mobile/theme/editorial_theme.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class BuyerCreateAlidpayScreen extends StatefulWidget {
  const BuyerCreateAlidpayScreen({super.key});

  @override
  State<BuyerCreateAlidpayScreen> createState() =>
      _BuyerCreateAlidpayScreenState();
}

class _BuyerCreateAlidpayScreenState extends State<BuyerCreateAlidpayScreen> {
  bool didCreate = false;

  Future<void> _openRingkasan({
    required String judul,
    required String penjual,
    required int nominal,
    required String role,
    String? kontak,
  }) async {
    _showLoadingDialog('Memuat data penjual & detail transaksi');

    try {
      final response = await DioClient.dio.get(
        ApiEndpoints.lookupUser(penjual),
      );

      if (!mounted) return;

      Navigator.pop(context);

      final namaPenjualAsli = response.data['name'] as String;

      final result = await Navigator.push<String>(
        context,
        MaterialPageRoute(
          builder: (_) => RingkasanAlidpayScreen(
            judulBarang: judul,
            nominal: nominal,
            role: 'pembeli',
            type: 'normal',
            lawanTransaksiName: namaPenjualAsli,
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
                        'Transaksi berhasil dibuat! Menunggu konfirmasi penjual.',
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

      Navigator.pop(context);

      final statusCode = e.response?.statusCode;

      String? message;

      if (e.response?.data is Map) {
        message = e.response?.data['message'] as String?;
      }

      String finalMessage;
      IconData icon;
      Color color;

      if (statusCode == 404) {
        finalMessage =
            message ?? 'ID penjual tidak ditemukan. Pastikan ID sudah benar.';
        icon = Icons.person_search_rounded;
        color = Colors.red.shade600;
      } else if (statusCode == 422) {
        finalMessage =
            message ?? 'Kamu tidak bisa bertransaksi dengan ID sendiri.';
        icon = Icons.block_rounded;
        color = Colors.orange.shade700;
      } else {
        finalMessage = message ?? 'Terjadi kesalahan. Silakan coba lagi.';
        icon = Icons.error_outline_rounded;
        color = Colors.red.shade600;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  finalMessage,
                  style: EditorialTheme.body(13, color: Colors.white),
                ),
              ),
            ],
          ),
          backgroundColor: color,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      Navigator.pop(context);

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(_errorSnack('Terjadi kesalahan: $e'));
    }
  }

  void _showLoadingDialog(String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) {
        return Center(
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
        );
      },
    );
  }

  SnackBar _successSnack(String text) {
    return SnackBar(
      content: Text(text, style: EditorialTheme.body(13, color: Colors.white)),
      backgroundColor: EditorialTheme.inkPrimary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
    );
  }

  SnackBar _errorSnack(String text) {
    return SnackBar(
      content: Text(text, style: EditorialTheme.body(13, color: Colors.white)),
      backgroundColor: Colors.red.shade700,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
    );
  }

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
        body: _BuyerForm(onSubmit: _openRingkasan),
      ),
    );
  }
}

class _BuyerForm extends StatefulWidget {
  final Future<void> Function({
    required String judul,
    required String penjual,
    required int nominal,
    String? kontak,
    required String role,
  })
  onSubmit;

  const _BuyerForm({required this.onSubmit});

  @override
  State<_BuyerForm> createState() => _BuyerFormState();
}

class _BuyerFormState extends State<_BuyerForm> {
  final _formKey = GlobalKey<FormState>();

  final _judulController = TextEditingController();
  final _penjualController = TextEditingController();
  final _kontakController = TextEditingController();
  final _nominalController = TextEditingController();

  @override
  void dispose() {
    _judulController.dispose();
    _penjualController.dispose();
    _kontakController.dispose();
    _nominalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildIntro(),

            const SizedBox(height: 32),

            _sectionLabel('BARANG / JASA'),

            _underlineField(
              controller: _judulController,
              hint: 'Contoh: iPhone 18 Pro — 256GB',
              validator: _req,
            ),

            const SizedBox(height: 28),

            _sectionLabel('ID PENJUAL'),

            _underlineField(
              controller: _penjualController,
              hint: '@ALID-8K4M2P9X',
              validator: _req,
              textCapitalization: TextCapitalization.characters,
            ),

            const SizedBox(height: 6),

            Text(
              'Minta penjual membagikan ID dari halaman profilnya.',
              style: EditorialTheme.body(
                11,
                color: EditorialTheme.inkPrimary.withValues(alpha: 0.45),
              ),
            ),

            const SizedBox(height: 28),

            _sectionLabel('KONTAK PENJUAL (OPSIONAL)'),

            _underlineField(
              controller: _kontakController,
              hint: 'No. HP atau nama panggilan',
            ),

            const SizedBox(height: 32),

            _nominalField(controller: _nominalController),

            const SizedBox(height: 20),

            _buildSecurityNote(),

            const SizedBox(height: 36),

            _submitButton(
              label: 'Lanjut ke Ringkasan',
              onPressed: _handleSubmit,
            ),

            const SizedBox(height: 12),

            Center(
              child: Text(
                'Pastikan ID penjual dan nominal transaksi sudah benar.',
                textAlign: TextAlign.center,
                style: EditorialTheme.body(
                  11,
                  color: EditorialTheme.inkPrimary.withValues(alpha: 0.45),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIntro() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: const BoxDecoration(
        color: EditorialTheme.inkPrimary,
        borderRadius: BorderRadius.all(Radius.circular(4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: EditorialTheme.gold.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: EditorialTheme.gold.withValues(alpha: 0.35),
              ),
            ),
            child: const Icon(
              Icons.handshake_outlined,
              color: EditorialTheme.gold,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Buat transaksi sebagai pembeli',
                  style: EditorialTheme.display(
                    16,
                    weight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Masukkan detail barang, ID penjual, dan nominal yang sudah disepakati.',
                  style: EditorialTheme.body(
                    12,
                    color: const Color(0xFFC7C4BD),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecurityNote() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: EditorialTheme.gold.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: EditorialTheme.gold.withValues(alpha: 0.30)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.verified_user_outlined,
            size: 19,
            color: EditorialTheme.gold,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'AlidPay akan memverifikasi ID penjual sebelum transaksi dibuat. Jangan lanjutkan jika data lawan transaksi tidak sesuai.',
              style: EditorialTheme.body(11, color: EditorialTheme.inkPrimary),
            ),
          ),
        ],
      ),
    );
  }

  void _handleSubmit() {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final cleanNominal = _nominalController.text.trim().replaceAll('.', '');

    final nominal = int.tryParse(cleanNominal);

    if (nominal == null || nominal <= 0) {
      return;
    }

    widget.onSubmit(
      judul: _judulController.text.trim(),
      penjual: _penjualController.text.trim(),
      nominal: nominal,
      kontak: _kontakController.text.trim().isEmpty
          ? null
          : _kontakController.text.trim(),
      role: 'pembeli',
    );
  }
}

Widget _sectionLabel(String text) {
  return Padding(
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
}

Widget _underlineField({
  required TextEditingController controller,
  required String hint,
  String? Function(String?)? validator,
  TextInputType? keyboardType,
  List<TextInputFormatter>? inputFormatters,
  TextCapitalization textCapitalization = TextCapitalization.none,
}) {
  return TextFormField(
    controller: controller,
    validator: validator,
    keyboardType: keyboardType,
    inputFormatters: inputFormatters,
    textCapitalization: textCapitalization,
    textInputAction: TextInputAction.next,
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

Widget _nominalField({required TextEditingController controller}) {
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
              textInputAction: TextInputAction.done,
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
                errorBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: Colors.red.shade400),
                ),
                focusedErrorBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: Colors.red.shade400, width: 2),
                ),
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

String? _req(String? value) {
  if (value == null || value.trim().isEmpty) {
    return 'Wajib diisi';
  }

  return null;
}

String? _reqNominal(String? value) {
  if (value == null || value.trim().isEmpty) {
    return 'Wajib diisi';
  }

  final clean = value.trim().replaceAll('.', '');

  final parsed = int.tryParse(clean);

  if (parsed == null) {
    return 'Harus berupa angka';
  }

  if (parsed <= 0) {
    return 'Nominal harus lebih dari 0';
  }

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

class RupiahInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue.copyWith(text: '');
    }

    final digitsOnly = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');

    if (digitsOnly.isEmpty) {
      return newValue.copyWith(text: '');
    }

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
      if (i != 0 && i % 3 == 0) {
        buffer.write('.');
      }

      buffer.write(reversed[i]);
    }

    return buffer.toString().split('').reversed.join('');
  }
}
