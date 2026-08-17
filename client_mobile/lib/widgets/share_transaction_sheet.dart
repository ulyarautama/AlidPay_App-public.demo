import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../models/transaction.dart';
import '../widgets/formatters.dart';
import '../theme/editorial_theme.dart';

// Bottom sheet buat share transaksi — gaya editorial, konsisten sama
// _showShareResultSheet di seller_create_alidpay_screen.dart
class ShareTransactionSheet extends StatelessWidget {
  final AlidpayTransaction trx;
  const ShareTransactionSheet({super.key, required this.trx});

  static Future<void> show(BuildContext context, AlidpayTransaction trx) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ShareTransactionSheet(trx: trx),
    );
  }

  String get _shareMessage {
    final String dateFormatted = DateFormat(
      'dd/MM/yyyy, HH:mm',
    ).format(trx.tanggal);
    final String priceFormatted = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(trx.nominal);

    return '''
[ALIDPAY - REKBER RESMI]

Ajakan konfirmasi transaksi aman via AlidPay.

🔹 Kode Transaksi  : ${trx.id}
🔹 Tanggal         : $dateFormatted WIB
🔹 Penjual         : ${trx.penjual}
🔹 Pembeli         : ${trx.pembeli}
🔹 Produk          : ${trx.judulBarang}
🔹 Total           : $priceFormatted

Buka aplikasi AlidPay, lalu masukkan Kode Transaksi di atas
untuk melihat detail & melakukan konfirmasi.

Atau unduh aplikasinya di sini:
https://play.google.com/store/apps/details?id=com.alidpay.app

---
Keamanan Transaksi:
1. AlidPay TIDAK PERNAH meminta OTP, password, atau PIN via WhatsApp/Telepon
2. Pastikan website beralamat https://alidpay.com
3. Dana Anda aman sampai barang diterima

Terima kasih telah bertransaksi dengan AlidPay.
''';
  }

  @override
  Widget build(BuildContext context) {
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

          // Header
          Row(
            children: [
              const Icon(
                Icons.ios_share_rounded,
                color: EditorialTheme.gold,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Bagikan Transaksi',
                style: EditorialTheme.display(17, weight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Kirim ke lawan transaksi biar gampang konfirmasi',
            style: EditorialTheme.body(
              12,
              color: EditorialTheme.inkPrimary.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 16),

          // Box Card: Kode Transaksi
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
                    color: EditorialTheme.inkPrimary.withValues(alpha: 0.45),
                  ).copyWith(letterSpacing: 0.6),
                ),
                const SizedBox(height: 4),
                InkWell(
                  onTap: () async {
                    await Clipboard.setData(ClipboardData(text: trx.id));
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Kode transaksi disalin',
                            style: EditorialTheme.body(13, color: Colors.white),
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
                  child: Row(
                    children: [
                      Flexible(
                        child: Text(
                          trx.id,
                          style: EditorialTheme.display(
                            16,
                            weight: FontWeight.w800,
                            color: EditorialTheme.gold,
                          ).copyWith(letterSpacing: 1.0),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        Icons.copy_rounded,
                        size: 14,
                        color: EditorialTheme.inkPrimary.withValues(alpha: 0.4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Container(height: 1, color: EditorialTheme.border),
                const SizedBox(height: 10),
                Text(
                  '${trx.judulBarang} · ${formatRupiah(trx.nominal)}',
                  style: EditorialTheme.body(12, weight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Preview Teks Pesan
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
                  _shareMessage,
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
                    await Clipboard.setData(ClipboardData(text: _shareMessage));
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Pesan format resmi disalin!',
                            style: EditorialTheme.body(13, color: Colors.white),
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
                    side: const BorderSide(color: EditorialTheme.inkPrimary),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  child: Text(
                    'Salin Pesan',
                    style: EditorialTheme.display(13, weight: FontWeight.w700),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    SharePlus.instance.share(
                      ShareParams(
                        text: _shareMessage,
                        title: 'Transaksi AlidPay',
                      ),
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
                    style: EditorialTheme.display(13, weight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
