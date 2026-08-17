// ringkasan_alidpay_screen.dart
//
// Mendukung dua mode:
//  - withId       : lawan transaksi sudah diketahui (nama + ID hasil lookup)
//  - isShareLink  : lawan transaksi belum ada — akan ditentukan setelah
//                   pembeli membuka tautan yang dibuat setelah konfirmasi ini.
//
// Gaya: struk editorial — hairline row per item, tanpa container tinted
// per-role. Role hanya muncul sebagai tag kecil, bukan tint seluruh kartu.

import 'package:client_mobile/theme/editorial_theme.dart';
import 'package:flutter/material.dart';
import '../widgets/formatters.dart';

typedef ConfirmWithIdCallback =
    Future<void> Function({
      required String judul,
      required int nominal,
      required String lawanTransaksiId,
      required String role,
      String? kontak,
      required String type,
    });

typedef ConfirmShareLinkCallback =
    Future<void> Function({
      required String judul,
      required int nominal,
      String? kontak,
      required String role,
      required String type,
    });

class RingkasanAlidpayScreen extends StatefulWidget {
  final String judulBarang;
  final int nominal;
  final String role; // 'pembeli' atau 'penjual'
  final String type;
  final bool isShareLink;

  // --- Mode: lawan sudah punya ID ---
  final String? lawanTransaksiName;
  final String? lawanTransaksiId;
  final String? kontakLawan;
  final ConfirmWithIdCallback? onConfirm;

  // --- Mode: belum punya akun, akan dibuatkan tautan ---
  final ConfirmShareLinkCallback? onConfirmShareLink;

  const RingkasanAlidpayScreen({
    super.key,
    required this.judulBarang,
    required this.nominal,
    required this.role,
    required this.type,
    this.isShareLink = false,
    this.lawanTransaksiName,
    this.lawanTransaksiId,
    this.kontakLawan,
    this.onConfirm,
    this.onConfirmShareLink,
  }) : assert(
         (isShareLink && onConfirmShareLink != null) ||
             (!isShareLink &&
                 lawanTransaksiName != null &&
                 lawanTransaksiId != null &&
                 onConfirm != null),
         'Mode withId butuh lawanTransaksiName/Id + onConfirm. '
         'Mode share-link butuh onConfirmShareLink.',
       );

  @override
  State<RingkasanAlidpayScreen> createState() => _RingkasanAlidpayScreenState();
}

class _RingkasanAlidpayScreenState extends State<RingkasanAlidpayScreen> {
  bool _submitting = false;

  @override
  Widget build(BuildContext context) {
    final int fee = (widget.nominal * 0.005).round();
    final total = widget.nominal + fee;
    final isSeller = widget.role == 'penjual';

    final labelLawan = widget.role == 'pembeli' ? 'Penjual' : 'Pembeli';
    final labelKontak = widget.role == 'pembeli'
        ? 'Kontak Penjual'
        : 'Kontak Pembeli';

    return Scaffold(
      backgroundColor: EditorialTheme.bg,
      appBar: AppBar(
        backgroundColor: EditorialTheme.bg,
        elevation: 0,
        scrolledUnderElevation: 0,
        foregroundColor: EditorialTheme.inkPrimary,
        title: Text(
          'Ringkasan Transaksi',
          style: EditorialTheme.display(18, weight: FontWeight.w800),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        children: [
          _roleTag(isSeller),
          const SizedBox(height: 14),

          // ---- STRUK ----
          Container(
            padding: const EdgeInsets.symmetric(vertical: 20),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: EditorialTheme.border, width: 1.4),
                bottom: BorderSide(color: EditorialTheme.border, width: 1.4),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.judulBarang,
                  style: EditorialTheme.display(19, weight: FontWeight.w800),
                ),
                const SizedBox(height: 10),

                if (!widget.isShareLink) ...[
                  _metaRow(labelLawan, widget.lawanTransaksiName!),
                  if (widget.kontakLawan != null &&
                      widget.kontakLawan!.isNotEmpty)
                    _metaRow(labelKontak, widget.kontakLawan!),
                ] else ...[
                  _metaRow(
                    labelLawan,
                    'Ditentukan setelah tautan dibuka',
                    italic: true,
                  ),
                  if (widget.kontakLawan != null &&
                      widget.kontakLawan!.isNotEmpty)
                    _metaRow('Kontak', widget.kontakLawan!),
                ],

                const SizedBox(height: 20),
                _priceRow('Harga Barang', formatRupiah(widget.nominal)),
                const SizedBox(height: 10),
                _priceRow(
                  'Biaya Layanan (0.5%)',
                  '- ${formatRupiah(fee)}',
                  muted: true,
                ),
                const SizedBox(height: 14),
                Container(height: 1, color: EditorialTheme.border),
                const SizedBox(height: 14),
                _priceRow(
                  'Total ${isSeller ? "yang kamu terima" : "yang harus dibayar"}',
                  formatRupiah(isSeller ? widget.nominal - fee : total),
                  emphasize: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ---- CATATAN (pull-quote style, bukan colored box) ----
          Container(
            padding: const EdgeInsets.only(left: 14),
            decoration: const BoxDecoration(
              border: Border(
                left: BorderSide(color: EditorialTheme.gold, width: 3),
              ),
            ),
            child: Text(
              _infoText(isSeller: isSeller, isShareLink: widget.isShareLink),
              style: EditorialTheme.body(
                13,
                color: EditorialTheme.inkPrimary.withValues(alpha: 0.75),
              ).copyWith(height: 1.5, fontStyle: FontStyle.italic),
            ),
          ),
          const SizedBox(height: 32),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: EditorialTheme.inkPrimary,
                disabledBackgroundColor: EditorialTheme.inkPrimary.withValues(
                  alpha: 0.5,
                ),
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              child: _submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      widget.isShareLink
                          ? 'Buat Tautan Pembayaran'
                          : 'Buat Transaksi Sekarang',
                      style: EditorialTheme.display(
                        14,
                        weight: FontWeight.w700,
                        color: Colors.white,
                      ).copyWith(letterSpacing: 0.4),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  String _infoText({required bool isSeller, required bool isShareLink}) {
    if (isShareLink) {
      return 'Setelah dibuat, kamu akan dapat tautan untuk dikirim manual '
          '(WhatsApp/SMS). Dana baru dianggap aktif setelah pembeli membuka '
          'tautan dan menyelesaikan konfirmasi di sisinya.';
    }
    return isSeller
        ? 'Pesanan akan diteruskan ke akun pembeli. Dana disimpan aman dan '
              'otomatis masuk ke saldomu setelah barang dikonfirmasi diterima.'
        : 'Dana kamu disimpan aman terlebih dahulu, baru diteruskan ke '
              'penjual setelah kamu mengonfirmasi barang diterima dengan baik.';
  }

  Future<void> _handleSubmit() async {
    setState(() => _submitting = true);
    try {
      if (widget.isShareLink) {
        await widget.onConfirmShareLink!(
          judul: widget.judulBarang,
          nominal: widget.nominal,
          kontak: widget.kontakLawan,
          role: widget.role,
          type: widget.type,
        );
      } else {
        await widget.onConfirm!(
          judul: widget.judulBarang,
          nominal: widget.nominal,
          lawanTransaksiId: widget.lawanTransaksiId!,
          role: widget.role,
          kontak: widget.kontakLawan,
          type: widget.type,
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Widget _roleTag(bool isSeller) {
    final color = isSeller
        ? EditorialTheme.accentOrange
        : const Color(0xFF7C6FD1); // purple — indikator role pembeli
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            border: Border.all(color: color),
            borderRadius: BorderRadius.circular(3),
          ),
          child: Text(
            isSeller ? 'SEBAGAI PENJUAL' : 'SEBAGAI PEMBELI',
            style: EditorialTheme.body(
              10,
              weight: FontWeight.w800,
              color: color,
            ).copyWith(letterSpacing: 0.4),
          ),
        ),
        if (widget.isShareLink) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              border: Border.all(
                color: EditorialTheme.inkPrimary.withValues(alpha: 0.3),
              ),
              borderRadius: BorderRadius.circular(3),
            ),
            child: Text(
              'TAUTAN BARU',
              style: EditorialTheme.body(
                10,
                weight: FontWeight.w800,
                color: EditorialTheme.inkPrimary.withValues(alpha: 0.6),
              ).copyWith(letterSpacing: 0.4),
            ),
          ),
        ],
      ],
    );
  }

  Widget _metaRow(String label, String value, {bool italic = false}) {
    return Padding(
      padding: const EdgeInsets.only(top: 3),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: '$label: ',
              style: EditorialTheme.body(
                12.5,
                color: EditorialTheme.inkPrimary.withValues(alpha: 0.45),
              ),
            ),
            TextSpan(
              text: value,
              style:
                  EditorialTheme.body(
                    12.5,
                    weight: FontWeight.w600,
                    color: EditorialTheme.inkPrimary.withValues(alpha: 0.75),
                  ).copyWith(
                    fontStyle: italic ? FontStyle.italic : FontStyle.normal,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _priceRow(
    String label,
    String value, {
    bool muted = false,
    bool emphasize = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: EditorialTheme.body(
            emphasize ? 14 : 13,
            weight: emphasize ? FontWeight.w700 : FontWeight.w500,
            color: EditorialTheme.inkPrimary.withValues(
              alpha: emphasize ? 1 : 0.6,
            ),
          ),
        ),
        Text(
          value,
          style: EditorialTheme.display(
            emphasize ? 20 : 14,
            weight: emphasize ? FontWeight.w800 : FontWeight.w600,
            color: emphasize
                ? EditorialTheme.gold
                : muted
                ? EditorialTheme.inkPrimary.withValues(alpha: 0.55)
                : EditorialTheme.inkPrimary,
          ),
        ),
      ],
    );
  }
}
