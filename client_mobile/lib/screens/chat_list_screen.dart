import 'package:client_mobile/providers/auth_provider.dart';
import 'package:client_mobile/providers/chat_notification_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/transaction.dart';
import '../services/transaction_service.dart';
import '../theme/editorial_theme.dart';
import 'chat_screen.dart';

class ChatListScreen extends StatefulWidget {
  final String userRole;
  const ChatListScreen({super.key, required this.userRole});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  late Future<List<AlidpayTransaction>> _futureTrx;

  final List<String> _categories = [
    'Semua',
    'Menunggu Konfirmasi',
    'Menunggu Pembayaran',
    'Diproses',
    'Selesai',
  ];

  String _selectedCategory = 'Semua';

  @override
  void initState() {
    super.initState();
    _futureTrx = TransactionService.fetchTransactions();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatNotificationProvider>().markChatListOpened();
      }
    });
  }

  @override
  void dispose() {
    try {
      context.read<ChatNotificationProvider>().markChatListClosed();
    } catch (_) {}
    super.dispose();
  }

  Future<void> _refresh() async {
    setState(() {
      _futureTrx = TransactionService.fetchTransactions();
    });
    if (mounted) {
      context.read<ChatNotificationProvider>().refreshSummaries();
    }
  }

  List<AlidpayTransaction> _filterTransactions(
    List<AlidpayTransaction> transactions,
  ) {
    if (_selectedCategory == 'Semua') return transactions;

    return transactions.where((t) {
      switch (_selectedCategory) {
        case 'Menunggu Konfirmasi':
          return t.status == AlidpayStatus.menungguKonfirmasi;
        case 'Menunggu Pembayaran':
          return t.status.name.toLowerCase().contains('pembayaran') ||
              t.status.label.contains('Pembayaran');
        case 'Diproses':
          return t.status.name.toLowerCase().contains('proses') ||
              t.status.label.contains('Proses');
        case 'Selesai':
          return t.status.name.toLowerCase().contains('selesai') ||
              t.status.label.contains('Selesai');
        default:
          return false;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final currentUserId = user?.id;
    final summaries = context.watch<ChatNotificationProvider>().summaries;

    return Scaffold(
      backgroundColor: EditorialTheme.bg,
      appBar: AppBar(
        title: Text(
          'Chat',
          style: EditorialTheme.display(20, weight: FontWeight.w800),
        ),
        backgroundColor: EditorialTheme.bg,
        surfaceTintColor: EditorialTheme.bg,
        elevation: 0,
        centerTitle: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              height: 52,
              margin: const EdgeInsets.only(bottom: 8),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 6,
                ),
                itemBuilder: (context, index) {
                  final category = _categories[index];
                  final isSelected = _selectedCategory == category;

                  return Padding(
                    // 🟢 FIX ERROR 1: Perbaikan penulisan EdgeInsets yang salah sintaks kemarin
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(category),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _selectedCategory = category);
                        }
                      },
                      selectedColor: EditorialTheme.inkPrimary,
                      labelStyle: EditorialTheme.body(
                        11,
                        color: isSelected
                            ? EditorialTheme.bg
                            : EditorialTheme.inkPrimary,
                        weight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                      backgroundColor: EditorialTheme.surface,
                      side: BorderSide(
                        color: isSelected
                            ? EditorialTheme.inkPrimary
                            : EditorialTheme.border,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      showCheckmark: false,
                    ),
                  );
                },
              ),
            ),
            Expanded(
              child: FutureBuilder<List<AlidpayTransaction>>(
                future: _futureTrx,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                      child: CircularProgressIndicator(
                        color: EditorialTheme.accentOrange,
                      ),
                    );
                  }

                  if (snapshot.hasError) {
                    return RefreshIndicator(
                      onRefresh: _refresh,
                      child: ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              vertical: 100,
                              horizontal: 32,
                            ),
                            child: Center(
                              child: Column(
                                children: [
                                  const Icon(
                                    Icons.error_outline_rounded,
                                    size: 38,
                                    color: EditorialTheme.accentOrange,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Gagal memuat percakapan.',
                                    textAlign: TextAlign.center,
                                    style: EditorialTheme.display(
                                      15,
                                      weight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Tarik layar ke bawah untuk mencoba lagi.',
                                    textAlign: TextAlign.center,
                                    style: EditorialTheme.body(12.5),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  final baseChatList = (snapshot.data ?? [])
                      .where(
                        (t) =>
                            t.buyer.id == currentUserId ||
                            t.seller.id == currentUserId,
                      )
                      .toList();

                  final chatList = _filterTransactions(baseChatList)
                    ..sort((a, b) => b.tanggal.compareTo(a.tanggal));

                  if (chatList.isEmpty) {
                    return RefreshIndicator(
                      onRefresh: _refresh,
                      child: ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(20, 80, 20, 100),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                vertical: 40,
                                horizontal: 24,
                              ),
                              decoration: BoxDecoration(
                                color: EditorialTheme.surface,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: EditorialTheme.border,
                                ),
                              ),
                              child: Column(
                                children: [
                                  const Icon(
                                    Icons.chat_bubble_outline_rounded,
                                    size: 42,
                                    color: EditorialTheme.accentOrange,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Belum ada percakapan aktif',
                                    style: EditorialTheme.display(
                                      14,
                                      weight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _selectedCategory == 'Semua'
                                        ? 'Chat muncul setelah transaksi terdeteksi'
                                        : 'Tidak ada chat di kategori $_selectedCategory',
                                    textAlign: TextAlign.center,
                                    style: EditorialTheme.body(12.5),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: _refresh,
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                      itemCount: chatList.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final trx = chatList[index];
                        final isPembeli = trx.buyer.id == currentUserId;
                        final lawanBicaraName = isPembeli
                            ? trx.penjual
                            : trx.pembeli;
                        final role = isPembeli ? 'pembeli' : 'penjual';

                        final summary = summaries[trx.id];
                        final unreadCount = summary?.unreadCount ?? 0;
                        final lastMessage = summary?.lastMessage;

                        return InkWell(
                          borderRadius: BorderRadius.circular(14),
                          onTap: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ChatScreen(
                                  transactionId: trx.id,
                                  currentUserRole: role,
                                  currentUserId: currentUserId ?? '',
                                  lawanBicaraName: lawanBicaraName,
                                ),
                              ),
                            );
                            if (context.mounted) {
                              context
                                  .read<ChatNotificationProvider>()
                                  .refreshSummaries();
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: EditorialTheme.surface,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: EditorialTheme.border),
                            ),
                            child: Row(
                              children: [
                                Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: EditorialTheme.accentOrange
                                            .withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Center(
                                        child: Text(
                                          lawanBicaraName.isNotEmpty
                                              ? lawanBicaraName[0].toUpperCase()
                                              : '?',
                                          style: EditorialTheme.display(
                                            16,
                                            weight: FontWeight.w800,
                                            color: EditorialTheme.accentOrange,
                                          ),
                                        ),
                                      ),
                                    ),
                                    if (unreadCount > 0)
                                      Positioned(
                                        right: -3,
                                        top: -3,
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            color: EditorialTheme.accentOrange,
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                              color: EditorialTheme.surface,
                                              width: 1.5,
                                            ),
                                          ),
                                          constraints: const BoxConstraints(
                                            minWidth: 18,
                                            minHeight: 18,
                                          ),
                                          child: Text(
                                            unreadCount > 9
                                                ? '9+'
                                                : '$unreadCount',
                                            textAlign: TextAlign.center,
                                            style: EditorialTheme.body(
                                              9,
                                              color: Colors.white,
                                              weight: FontWeight.w700,
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        lawanBicaraName,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: EditorialTheme.display(
                                          14,
                                          weight: unreadCount > 0
                                              ? FontWeight.w800
                                              : FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        lastMessage ?? trx.judulBarang,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: EditorialTheme.body(
                                          12.5,
                                          weight: unreadCount > 0
                                              ? FontWeight.w600
                                              : FontWeight.w400,
                                          color: unreadCount > 0
                                              ? EditorialTheme.inkPrimary
                                              : EditorialTheme.inkSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: EditorialTheme.accentOrange
                                        .withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    trx.status.label,
                                    style: EditorialTheme.body(
                                      10.5,
                                      weight: FontWeight.w700,
                                      color: EditorialTheme.accentOrange,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
} // 🟢 FIX ERROR 2: Semua bracket penutup berantakan di ujung file sekarang sudah sejajar dan berpasangan rapi!
