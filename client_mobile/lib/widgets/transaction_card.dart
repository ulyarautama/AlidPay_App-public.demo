import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/transaction.dart';
import '../providers/chat_notification_provider.dart';
import 'formatters.dart';

class TransactionCard extends StatelessWidget {
  final AlidpayTransaction trx;
  final VoidCallback? onTap;

  const TransactionCard({super.key, required this.trx, this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = statusColor(trx.status);

    // 🟢 Ambil summary chat (unread count + last message) buat transaksi ini
    final summary = context.watch<ChatNotificationProvider>().summaries[trx.id];
    final unreadCount = summary?.unreadCount ?? 0;
    final lastMessage = summary?.lastMessage;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Icon Status Utama + badge unread
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(statusIcon(trx.status), color: color, size: 21),
                ),
                // 🟢 Badge merah kalau ada chat belum dibaca dari transaksi ini
                if (unreadCount > 0)
                  Positioned(
                    right: -6,
                    top: -6,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 18,
                        minHeight: 18,
                      ),
                      child: Text(
                        unreadCount > 9 ? '9+' : '$unreadCount',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),

            // 2. Bagian Informasi Tengah
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    trx.judulBarang,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14.5,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 6),

                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                    alignment: Alignment.center,
                    child: Text(
                      trx.status.label,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: color,
                        height: 1,
                      ),
                    ),
                  ),

                  // 🟢 Preview chat terakhir, kalau ada
                  if (lastMessage != null) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(
                          Icons.chat_bubble_rounded,
                          size: 12,
                          color: unreadCount > 0
                              ? const Color(0xFF3B82F6)
                              : Colors.grey.shade400,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            lastMessage,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: unreadCount > 0
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                              color: unreadCount > 0
                                  ? const Color(0xFF1F2937)
                                  : Colors.grey.shade500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 12),

            // 3. Nominal
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(formatRupiah(trx.nominal), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5, color: Color(0xFF1F2937))),
                const SizedBox(height: 4),
                const Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF94A3B8)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
