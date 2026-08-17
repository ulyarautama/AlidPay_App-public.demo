import 'package:flutter/material.dart';
import '../models/transaction.dart';

String formatRupiah(int value) {
  final str = value.toString();
  final buffer = StringBuffer();
  int count = 0;
  for (int i = str.length - 1; i >= 0; i--) {
    buffer.write(str[i]);
    count++;
    if (count % 3 == 0 && i != 0) buffer.write('.');
  }
  return 'Rp${buffer.toString().split('').reversed.join()}';
}

/// Versi ringkas buat ruang sempit (banner stat card dll)
/// Rp1.500.000 -> Rp1,5jt | Rp100.000.000 -> Rp100jt | Rp2.000.000.000 -> Rp2M
String formatRupiahCompact(int amount) {
  if (amount >= 1000000000) {
    return 'Rp${_trimDecimal(amount / 1000000000)}M';
  } else if (amount >= 1000000) {
    return 'Rp${_trimDecimal(amount / 1000000)}jt';
  } else if (amount >= 1000) {
    return 'Rp${_trimDecimal(amount / 1000)}rb';
  }
  return formatRupiah(amount);
}

String _trimDecimal(double val) {
  final rounded = (val * 10).round() / 10;
  if (rounded == rounded.roundToDouble()) {
    return rounded.toInt().toString();
  }
  return rounded.toStringAsFixed(1).replaceAll('.', ',');
}

Color statusColor(AlidpayStatus status) {
  switch (status) {
    case AlidpayStatus.draftLink: // ⬅️ TAMBAH
      return const Color(0xFF9CA3AF);
    case AlidpayStatus.menungguKonfirmasi:
      return Colors.orange;
    case AlidpayStatus.menungguPembayaran:
      return Colors.amber;
    case AlidpayStatus.danaDitahan:
      return const Color(0xFF3B82F6); // blue
    case AlidpayStatus.barangDikirim:
      return const Color(0xFF8B5CF6); // purple
    case AlidpayStatus.danaDicairkan:
      return const Color(0xFF10B981); // green
    case AlidpayStatus.sengketa:
      return const Color(0xFFEF4444); // red
    case AlidpayStatus.dibatalkan:
      return const Color(0xFF6B7280); // grey
  }
}

IconData statusIcon(AlidpayStatus status) {
  switch (status) {
    //  TAMBAHIN INI (Ikon lonceng/notif konfirmasi)
    case AlidpayStatus.draftLink: // ⬅️ TAMBAH
      return Icons.link_rounded;
    case AlidpayStatus.menungguKonfirmasi:
      return Icons.notification_important_rounded;
    case AlidpayStatus.menungguPembayaran:
      return Icons.hourglass_empty_rounded;
    case AlidpayStatus.danaDitahan:
      return Icons.lock_clock_rounded;
    case AlidpayStatus.barangDikirim:
      return Icons.local_shipping_rounded;
    case AlidpayStatus.danaDicairkan:
      return Icons.check_circle_rounded;
    case AlidpayStatus.sengketa:
      return Icons.gavel_rounded;
    case AlidpayStatus.dibatalkan:
      return Icons.cancel_rounded;
  }
}
