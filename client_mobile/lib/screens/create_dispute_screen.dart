import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

import '../models/transaction.dart';
import '../services/transaction_service.dart';
import '../widgets/formatters.dart';

class CreateDisputeScreen extends StatefulWidget {
  final AlidpayTransaction trx;
  final String userRole;

  const CreateDisputeScreen({
    super.key,
    required this.userRole,
    required this.trx,
  });

  @override
  State<CreateDisputeScreen> createState() => _CreateDisputeScreenState();
}

class _CreateDisputeScreenState extends State<CreateDisputeScreen> {
  final _descriptionController = TextEditingController();

  String? _selectedCategory;
  String? _selectedReason;
  String? _selectedResolution;

  bool _understandHold = false;
  bool _confirmTruth = false;
  bool _isSubmitting = false;

  bool get _isBuyer => widget.userRole.toLowerCase() == 'pembeli';

  bool get _isSeller => widget.userRole.toLowerCase() == 'penjual';

  String get _otherPartyTitle {
    if (_isBuyer) {
      return 'Masalah dengan Penjual';
    }

    if (_isSeller) {
      return 'Masalah dengan Pembeli';
    }

    return 'Masalah dengan Pihak Transaksi';
  }

  String get _otherPartySubtitle {
    if (_isBuyer) {
      return 'Masalah yang berkaitan dengan penjual dalam transaksi ini';
    }

    if (_isSeller) {
      return 'Masalah yang berkaitan dengan pembeli dalam transaksi ini';
    }

    return 'Masalah yang berkaitan dengan pihak transaksi';
  }

  /*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

  List<Map<String, dynamic>> get _categories => [
    {
      'value': 'barang_jasa',
      'title': 'Barang / Jasa',
      'subtitle': 'Masalah terkait barang atau jasa dalam transaksi.',
      'icon': Icons.inventory_2_outlined,
    },
    {
      'value': 'pihak_transaksi',
      'title': _otherPartyTitle,
      'subtitle': _otherPartySubtitle,
      'icon': Icons.people_outline_rounded,
    },
    {
      'value': 'indikasi_penipuan',
      'title': 'Aktivitas Mencurigakan',
      'subtitle': 'Indikasi penipuan atau aktivitas yang tidak wajar.',
      'icon': Icons.warning_amber_rounded,
    },
    {
      'value': 'lainnya',
      'title': 'Masalah Lainnya',
      'subtitle': 'Masalah lain yang membutuhkan bantuan mediator.',
      'icon': Icons.more_horiz_rounded,
    },
  ];

  /*
|--------------------------------------------------------------------------
| REASONS BY CATEGORY
|--------------------------------------------------------------------------
*/
  List<Map<String, dynamic>> get _availableReasons {
    switch (_selectedCategory) {
      case 'barang_jasa':
        return [
          {
            'value': 'barang_tidak_sesuai',
            'title': 'Barang Tidak Sesuai',
            'description': 'Barang atau jasa tidak sesuai dengan kesepakatan.',
            'icon': Icons.inventory_2_outlined,
          },
          {
            'value': 'barang_rusak',
            'title': 'Barang Rusak / Cacat',
            'description': 'Barang mengalami kerusakan atau cacat.',
            'icon': Icons.broken_image_outlined,
          },
          {
            'value': 'barang_tidak_diterima',
            'title': 'Barang Tidak Diterima',
            'description': 'Barang belum diterima sesuai transaksi.',
            'icon': Icons.local_shipping_outlined,
          },
          {
            'value': 'penjual_tidak_mengirim',
            'title': 'Penjual Tidak Mengirim',
            'description': 'Barang belum dikirim setelah pembayaran.',
            'icon': Icons.outbox_outlined,
          },
          {
            'value': 'jumlah_tidak_sesuai',
            'title': 'Jumlah Barang Tidak Sesuai',
            'description':
                'Jumlah barang yang diterima berbeda dengan kesepakatan.',
            'icon': Icons.format_list_numbered_rounded,
          },
        ];
      case 'pihak_transaksi':
        return [
          if (_isBuyer)
            {
              'value': 'penjual_tidak_merespons',
              'title': 'Penjual Tidak Merespons',
              'description':
                  'Penjual tidak memberikan respons terkait transaksi.',
              'icon': Icons.person_off_outlined,
            },

          if (_isSeller)
            {
              'value': 'pembeli_tidak_merespons',
              'title': 'Pembeli Tidak Merespons',
              'description':
                  'Pembeli tidak memberikan respons terkait transaksi.',
              'icon': Icons.person_off_outlined,
            },

          {
            'value': 'pihak_melanggar_kesepakatan',
            'title': 'Kesepakatan Tidak Dipenuhi',
            'description': 'Pihak lain tidak memenuhi kesepakatan transaksi.',
            'icon': Icons.handshake_outlined,
          },
        ];

      case 'indikasi_penipuan':
        return [
          {
            'value': 'indikasi_penipuan',
            'title': 'Ada Indikasi Penipuan',
            'description':
                'Terdapat indikasi tindakan yang mencurigakan atau penipuan.',
            'icon': Icons.gpp_maybe_outlined,
          },
          {
            'value': 'aktivitas_tidak_wajar',
            'title': 'Aktivitas Tidak Wajar',
            'description':
                'Terdapat aktivitas yang tidak sesuai dengan transaksi.',
            'icon': Icons.warning_amber_rounded,
          },
        ];

      case 'lainnya':
        return [
          {
            'value': 'masalah_lainnya',
            'title': 'Masalah Lainnya',
            'description':
                'Masalah yang belum termasuk dalam kategori di atas.',
            'icon': Icons.more_horiz_rounded,
          },
        ];

      default:
        return [];
    }
  }
  /*
  |--------------------------------------------------------------------------
  | RESOLUTION
  |--------------------------------------------------------------------------
  */

  final List<Map<String, dynamic>> _resolutions = [
    {
      'value': 'refund',
      'title': 'Refund dana kepada saya',
      'description': 'Saya meminta dana transaksi dikembalikan kepada saya.',
      'icon': Icons.account_balance_wallet_outlined,
    },
    {
      'value': 'release_seller',
      'title': 'Lepaskan dana kepada penjual',
      'description':
          'Saya meminta mediator meninjau dan melepaskan dana kepada penjual.',
      'icon': Icons.payments_outlined,
    },
    {
      'value': 'resolve_transaction',
      'title': 'Penyelesaian transaksi',
      'description':
          'Saya ingin transaksi diperbaiki atau diselesaikan terlebih dahulu.',
      'icon': Icons.handshake_outlined,
    },
    {
      'value': 'mediator_decision',
      'title': 'Mediator menentukan',
      'description':
          'Saya menyerahkan keputusan penyelesaian kepada mediator AlidPay.',
      'icon': Icons.gavel_outlined,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | EVIDENCE
  |--------------------------------------------------------------------------
  |
  | Bukti dipilih dari galeri, lalu dikirim ke backend sebagai multipart.
  |
  */

  final ImagePicker _imagePicker = ImagePicker();
  final List<XFile> _evidenceFiles = [];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  /*
  |--------------------------------------------------------------------------
  | GETTERS
  |--------------------------------------------------------------------------
  */
  String get _selectedReasonTitle {
    for (final reason in _availableReasons) {
      if (reason['value'] == _selectedReason) {
        return reason['title'] as String;
      }
    }

    return '-';
  }

  String get _selectedResolutionTitle {
    for (final resolution in _resolutions) {
      if (resolution['value'] == _selectedResolution) {
        return resolution['title'] as String;
      }
    }

    return '-';
  }

  bool get _descriptionValid {
    return _descriptionController.text.trim().length >= 50;
  }

  bool get _canSubmit {
    return _selectedCategory != null &&
        _selectedReason != null &&
        _descriptionValid &&
        _selectedResolution != null &&
        _understandHold &&
        _confirmTruth;
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  Future<void> _submitDispute() async {
    if (!_canSubmit || _isSubmitting) {
      return;
    }

    final confirmed = await _showFinalConfirmation();

    if (!confirmed || !mounted) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      await TransactionService.createDispute(
        widget.trx.id,
        category: _selectedCategory!,
        issueType: _selectedReason!,
        description: _descriptionController.text.trim(),
        requestedResolution: _selectedResolution!,
        evidenceFiles: List.unmodifiable(_evidenceFiles),
      );

      if (!mounted) {
        return;
      }

      await _showSuccessDialog();

      if (!mounted) {
        return;
      }

      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal mengajukan sengketa.\n${e.toString()}'),
          backgroundColor: const Color(0xFFDC2626),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FINAL CONFIRMATION
  |--------------------------------------------------------------------------
  */

  Future<bool> _showFinalConfirmation() async {
    return await showModalBottomSheet<bool>(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) {
            return Container(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).padding.bottom + 20,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SafeArea(
                top: false,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 42,
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE5E7EB),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    const Row(
                      children: [
                        Icon(
                          Icons.gavel_rounded,
                          color: Color(0xFF6B1E2C),
                          size: 24,
                        ),
                        SizedBox(width: 10),
                        Text(
                          'Konfirmasi Pengajuan',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF111827),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Kamu akan mengirim laporan sengketa ini kepada '
                      'mediator AlidPay.',
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.5,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED),
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(color: const Color(0xFFFED7AA)),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.info_outline_rounded,
                            color: Color(0xFFEA580C),
                            size: 19,
                          ),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Setelah diajukan, transaksi akan masuk '
                              'proses pemeriksaan dan pencairan dana '
                              'dapat ditangguhkan sampai sengketa selesai.',
                              style: TextStyle(
                                fontSize: 12,
                                height: 1.5,
                                color: Color(0xFF7C2D12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              Navigator.pop(context, false);
                            },
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size.fromHeight(50),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: const Text(
                              'Periksa Lagi',
                              style: TextStyle(fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context, true);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6B1E2C),
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(50),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: const Text(
                              'Kirim Sengketa',
                              style: TextStyle(fontWeight: FontWeight.w800),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ) ??
        false;
  }

  /*
  |--------------------------------------------------------------------------
  | SUCCESS
  |--------------------------------------------------------------------------
  */

  Future<void> _showSuccessDialog() async {
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(22),
          ),
          contentPadding: const EdgeInsets.fromLTRB(24, 26, 24, 18),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: const Icon(
                  Icons.shield_rounded,
                  color: Color(0xFF10B981),
                  size: 34,
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Sengketa Diajukan',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Laporan sengketa berhasil dikirim dan akan '
                'ditinjau oleh mediator AlidPay.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.5,
                  color: Color(0xFF6B7280),
                ),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(13),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.lock_outline_rounded,
                      size: 18,
                      color: Color(0xFF6B1E2C),
                    ),
                    SizedBox(width: 9),
                    Expanded(
                      child: Text(
                        'Dana transaksi tetap diamankan selama '
                        'proses penyelesaian sesuai status transaksi.',
                        style: TextStyle(
                          fontSize: 11.5,
                          height: 1.45,
                          color: Color(0xFF4B5563),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6B1E2C),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Mengerti',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | BUILD
  |--------------------------------------------------------------------------
  */

  @override
  Widget build(BuildContext context) {
    final trx = widget.trx;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: _isSubmitting ? null : () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_rounded),
        ),
        title: const Text(
          'Ajukan Sengketa',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
          ),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 35),
          children: [
            _buildWarningCard(),
            const SizedBox(height: 22),

            _buildSectionTitle(
              'Transaksi yang Disengketakan',
              'Pastikan kamu mengajukan sengketa pada transaksi yang benar.',
            ),
            const SizedBox(height: 12),

            _buildTransactionCard(trx),
            const SizedBox(height: 28),

            _buildSectionTitle(
              '1. Jenis Masalah',
              'Pilih kategori dan alasan yang paling sesuai.',
            ),
            const SizedBox(height: 13),

            _buildCategorySelector(),
            const SizedBox(height: 16),

            if (_selectedCategory != null) _buildReasonSelector(),

            const SizedBox(height: 28),

            _buildSectionTitle(
              '2. Ceritakan Kronologi',
              'Jelaskan apa yang terjadi dari awal hingga masalah muncul.',
            ),
            const SizedBox(height: 12),

            _buildDescriptionField(),
            const SizedBox(height: 28),

            _buildSectionTitle(
              '3. Bukti Pendukung',
              'Sertakan bukti yang dapat membantu mediator memverifikasi laporan.',
            ),
            const SizedBox(height: 12),

            _buildEvidenceSection(),
            const SizedBox(height: 28),

            _buildSectionTitle(
              '4. Penyelesaian yang Diinginkan',
              'Pilih hasil yang kamu harapkan dari proses sengketa.',
            ),
            const SizedBox(height: 12),

            _buildResolutionSelector(),
            const SizedBox(height: 28),

            _buildConfirmationSection(),
            const SizedBox(height: 28),

            _buildDisputeSummary(),
            const SizedBox(height: 20),

            _buildSubmitButton(),

            const SizedBox(height: 12),

            const Text(
              'Keputusan akhir penyelesaian sengketa ditentukan '
              'berdasarkan informasi, bukti, dan riwayat transaksi '
              'yang tersedia.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 10.5,
                height: 1.45,
                color: Color(0xFF9CA3AF),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | WARNING CARD
  |--------------------------------------------------------------------------
  */

  Widget _buildWarningCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: const Color(0xFFFFEDD5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.warning_amber_rounded,
              color: Color(0xFFEA580C),
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sebelum Mengajukan Sengketa',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF9A3412),
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Setelah sengketa diajukan, transaksi akan masuk '
                  'proses pemeriksaan. Pencairan dana dapat '
                  'ditangguhkan sampai sengketa selesai diselesaikan.',
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.5,
                    color: Color(0xFF7C2D12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SECTION TITLE
  |--------------------------------------------------------------------------
  */

  Widget _buildSectionTitle(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w900,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 5),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 12,
            height: 1.4,
            color: Color(0xFF6B7280),
          ),
        ),
      ],
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TRANSACTION
  |--------------------------------------------------------------------------
  */

  Widget _buildTransactionCard(AlidpayTransaction trx) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: [
          _infoRow('ID Transaksi', trx.id, mono: true),
          const Divider(height: 24),
          _infoRow('Barang / Jasa', trx.judulBarang),
          const Divider(height: 24),
          _infoRow('Penjual', trx.penjual),
          const Divider(height: 24),
          _infoRow('Pembeli', trx.pembeli),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Dana Terproteksi',
                style: TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
              ),
              Text(
                formatRupiah(trx.nominal),
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF6B1E2C),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CATEGORY SELECTOR
  |--------------------------------------------------------------------------
  */

  Widget _buildCategorySelector() {
    return Column(
      children: _categories.map((category) {
        final selected = _selectedCategory == category['value'];

        return Padding(
          padding: const EdgeInsets.only(bottom: 9),
          child: InkWell(
            onTap: _isSubmitting
                ? null
                : () {
                    setState(() {
                      _selectedCategory = category['value'] as String;
                      _selectedReason = null;
                    });
                  },
            borderRadius: BorderRadius.circular(16),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: selected ? const Color(0xFFFDF7F8) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: selected
                      ? const Color(0xFF6B1E2C)
                      : const Color(0xFFE5E7EB),
                  width: selected ? 1.5 : 1,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: selected
                          ? const Color(0xFFF2E7E9)
                          : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(13),
                    ),
                    child: Icon(
                      category['icon'] as IconData,
                      color: selected
                          ? const Color(0xFF6B1E2C)
                          : const Color(0xFF6B7280),
                      size: 21,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          category['title'] as String,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          category['subtitle'] as String,
                          style: const TextStyle(
                            fontSize: 11,
                            height: 1.4,
                            color: Color(0xFF9CA3AF),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    selected
                        ? Icons.check_circle_rounded
                        : Icons.radio_button_unchecked,
                    color: selected
                        ? const Color(0xFF6B1E2C)
                        : const Color(0xFFD1D5DB),
                    size: 21,
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | REASON SELECTOR
  |--------------------------------------------------------------------------
  */

  Widget _buildReasonSelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Pilih alasan spesifik',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: Color(0xFF374151),
            ),
          ),
          const SizedBox(height: 10),
          ..._availableReasons.map((reason) {
            final selected = _selectedReason == reason['value'];

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: _isSubmitting
                    ? null
                    : () {
                        setState(() {
                          _selectedReason = reason['value'] as String;
                        });
                      },
                borderRadius: BorderRadius.circular(13),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 160),
                  padding: const EdgeInsets.all(13),
                  decoration: BoxDecoration(
                    color: selected ? Colors.white : Colors.transparent,
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(
                      color: selected
                          ? const Color(0xFF6B1E2C)
                          : const Color(0xFFE5E7EB),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        reason['icon'] as IconData,
                        size: 19,
                        color: selected
                            ? const Color(0xFF6B1E2C)
                            : const Color(0xFF9CA3AF),
                      ),
                      const SizedBox(width: 11),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              reason['title'] as String,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              reason['description'] as String,
                              style: const TextStyle(
                                fontSize: 10.5,
                                height: 1.4,
                                color: Color(0xFF9CA3AF),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        selected
                            ? Icons.radio_button_checked
                            : Icons.radio_button_unchecked,
                        size: 19,
                        color: selected
                            ? const Color(0xFF6B1E2C)
                            : const Color(0xFFD1D5DB),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DESCRIPTION
  |--------------------------------------------------------------------------
  */

  Widget _buildDescriptionField() {
    final length = _descriptionController.text.trim().length;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
      ),
      child: TextField(
        controller: _descriptionController,
        enabled: !_isSubmitting,
        maxLines: 8,
        minLines: 6,
        onChanged: (_) {
          setState(() {});
        },
        decoration: InputDecoration(
          hintText:
              'Contoh:\n\n'
              'Barang yang saya terima berbeda dengan '
              'kesepakatan awal. Pada transaksi disepakati...',
          hintStyle: const TextStyle(
            fontSize: 12,
            color: Color(0xFF9CA3AF),
            height: 1.5,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.all(17),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFF6B1E2C), width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFFDC2626)),
          ),
          helperText: length < 50
              ? 'Minimal 50 karakter ($length/50)'
              : 'Kronologi sudah memenuhi minimal karakter.',
          helperStyle: TextStyle(
            fontSize: 10.5,
            color: length < 50
                ? const Color(0xFFDC2626)
                : const Color(0xFF059669),
          ),
        ),
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EVIDENCE
  |--------------------------------------------------------------------------
  */

  Widget _buildEvidenceSection() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Icon(
              Icons.cloud_upload_outlined,
              color: Color(0xFF6B7280),
              size: 25,
            ),
          ),
          const SizedBox(height: 11),
          const Text(
            'Tambahkan bukti pendukung',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 5),
          const Text(
            'Foto, screenshot chat, invoice, bukti pembayaran, '
            'bukti pengiriman, atau dokumen lainnya.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10.5,
              height: 1.4,
              color: Color(0xFF9CA3AF),
            ),
          ),
          const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: _isSubmitting ? null : _pickEvidenceImages,
            icon: const Icon(Icons.add_rounded, size: 17),
            label: const Text('Tambahkan Bukti'),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF6B1E2C),
              side: const BorderSide(color: Color(0xFF6B1E2C)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(11),
              ),
            ),
          ),
          if (_evidenceFiles.isNotEmpty) ...[
            const SizedBox(height: 15),
            const Divider(),
            const SizedBox(height: 5),
            ..._evidenceFiles.map((file) => _evidenceFileTile(file)),
          ],
        ],
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | IMAGE EVIDENCE
  |
  */

  Future<void> _pickEvidenceImages() async {
    if (_evidenceFiles.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Maksimal 5 bukti dapat ditambahkan.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    try {
      final remaining = 5 - _evidenceFiles.length;
      final selectedFiles = await _imagePicker.pickMultiImage(
        limit: remaining,
        imageQuality: 75,
        maxWidth: 1600,
      );

      final acceptedFiles = <XFile>[];
      var rejectedLargeFile = false;
      var totalSize = 0;

      for (final file in _evidenceFiles) {
        totalSize += await file.length();
      }

      for (final file in selectedFiles) {
        final fileSize = await file.length();

        if (fileSize > 2 * 1024 * 1024 ||
            totalSize + fileSize > 7 * 1024 * 1024) {
          rejectedLargeFile = true;
          continue;
        }

        if (_evidenceFiles.any((existing) => existing.path == file.path)) {
          continue;
        }

        acceptedFiles.add(file);
        totalSize += fileSize;
      }

      if (!mounted) {
        return;
      }

      setState(() {
        _evidenceFiles.addAll(acceptedFiles.take(remaining));
      });

      if (rejectedLargeFile) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Maksimal 2 MB per gambar dan 7 MB untuk seluruh bukti.',
            ),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (error, stackTrace) {
      debugPrint('Gagal membuka image picker: $error');
      debugPrintStack(stackTrace: stackTrace);

      if (!mounted) {
        return;
      }

      final message = switch (error) {
        MissingPluginException() =>
          'Plugin galeri belum aktif. Tutup aplikasi, lalu jalankan ulang flutter run.',
        PlatformException(:final code) =>
          'Galeri gagal dibuka ($code). Periksa izin foto lalu coba lagi.',
        _ => 'Gagal membuka galeri gambar. Silakan coba lagi.',
      };

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
      );
    }
  }

  Widget _evidenceFileTile(XFile file) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(11),
        decoration: BoxDecoration(
          color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Row(
          children: [
            Container(
              width: 35,
              height: 35,
              decoration: BoxDecoration(
                color: const Color(0xFFF2E7E9),
                borderRadius: BorderRadius.circular(9),
              ),
              child: const Icon(
                Icons.image_outlined,
                size: 18,
                color: Color(0xFF6B1E2C),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                file.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            IconButton(
              visualDensity: VisualDensity.compact,
              onPressed: _isSubmitting
                  ? null
                  : () {
                      setState(() {
                        _evidenceFiles.remove(file);
                      });
                    },
              icon: const Icon(
                Icons.close_rounded,
                size: 17,
                color: Color(0xFF9CA3AF),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RESOLUTION
  |--------------------------------------------------------------------------
  */

  Widget _buildResolutionSelector() {
    return Column(
      children: _resolutions.map((resolution) {
        final selected = _selectedResolution == resolution['value'];

        return Padding(
          padding: const EdgeInsets.only(bottom: 9),
          child: InkWell(
            onTap: _isSubmitting
                ? null
                : () {
                    setState(() {
                      _selectedResolution = resolution['value'] as String;
                    });
                  },
            borderRadius: BorderRadius.circular(15),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: selected ? const Color(0xFFFDF7F8) : Colors.white,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(
                  color: selected
                      ? const Color(0xFF6B1E2C)
                      : const Color(0xFFE5E7EB),
                  width: selected ? 1.5 : 1,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: selected
                          ? const Color(0xFFF2E7E9)
                          : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      resolution['icon'] as IconData,
                      size: 20,
                      color: selected
                          ? const Color(0xFF6B1E2C)
                          : const Color(0xFF6B7280),
                    ),
                  ),
                  const SizedBox(width: 11),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          resolution['title'] as String,
                          style: const TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          resolution['description'] as String,
                          style: const TextStyle(
                            fontSize: 10.5,
                            height: 1.4,
                            color: Color(0xFF9CA3AF),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    selected
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked,
                    size: 20,
                    color: selected
                        ? const Color(0xFF6B1E2C)
                        : const Color(0xFFD1D5DB),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRMATION
  |--------------------------------------------------------------------------
  */

  Widget _buildConfirmationSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '5. Sebelum Mengajukan',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 7),
          const Text(
            'Pastikan kamu memahami konsekuensi dari pengajuan '
            'sengketa sebelum melanjutkan.',
            style: TextStyle(
              fontSize: 11.5,
              height: 1.45,
              color: Color(0xFF6B7280),
            ),
          ),
          const SizedBox(height: 14),
          _buildCheckboxRow(
            value: _understandHold,
            onChanged: (value) {
              setState(() {
                _understandHold = value;
              });
            },
            text:
                'Saya memahami bahwa pencairan dana dapat '
                'ditangguhkan selama proses sengketa.',
          ),
          const SizedBox(height: 8),
          _buildCheckboxRow(
            value: _confirmTruth,
            onChanged: (value) {
              setState(() {
                _confirmTruth = value;
              });
            },
            text:
                'Saya menyatakan bahwa informasi dan bukti '
                'yang saya berikan adalah benar.',
          ),
        ],
      ),
    );
  }

  Widget _buildCheckboxRow({
    required bool value,
    required ValueChanged<bool> onChanged,
    required String text,
  }) {
    return InkWell(
      onTap: _isSubmitting ? null : () => onChanged(!value),
      borderRadius: BorderRadius.circular(10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Checkbox(
            value: value,
            activeColor: const Color(0xFF6B1E2C),
            onChanged: _isSubmitting
                ? null
                : (newValue) {
                    onChanged(newValue ?? false);
                  },
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 12, right: 5),
              child: Text(
                text,
                style: const TextStyle(
                  fontSize: 11.5,
                  height: 1.5,
                  color: Color(0xFF4B5563),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  Widget _buildDisputeSummary() {
    final descriptionLength = _descriptionController.text.trim().length;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.fact_check_outlined,
                size: 19,
                color: Color(0xFF6B1E2C),
              ),
              SizedBox(width: 8),
              Text(
                'Ringkasan Sengketa',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _summaryRow('Transaksi', widget.trx.id, mono: true),
          const Divider(height: 22),
          _summaryRow('Nilai Transaksi', formatRupiah(widget.trx.nominal)),
          const Divider(height: 22),
          _summaryRow('Jenis Masalah', _selectedReasonTitle),
          const Divider(height: 22),
          _summaryRow(
            'Kronologi',
            descriptionLength == 0 ? '-' : '$descriptionLength karakter',
          ),
          const Divider(height: 22),
          _summaryRow(
            'Bukti',
            _evidenceFiles.isEmpty
                ? 'Belum ada file'
                : '${_evidenceFiles.length} file terlampir',
          ),
          const Divider(height: 22),
          _summaryRow('Penyelesaian', _selectedResolutionTitle),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool mono = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 11.5, color: Color(0xFF6B7280)),
          ),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w800,
              fontFamily: mono ? 'monospace' : null,
              color: const Color(0xFF1F2937),
            ),
          ),
        ),
      ],
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  Widget _buildSubmitButton() {
    return SizedBox(
      height: 55,
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _canSubmit && !_isSubmitting ? _submitDispute : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6B1E2C),
          disabledBackgroundColor: const Color(0xFFE5E7EB),
          foregroundColor: Colors.white,
          disabledForegroundColor: const Color(0xFF9CA3AF),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
        ),
        child: _isSubmitting
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shield_outlined, size: 19),
                  SizedBox(width: 9),
                  Text(
                    'Ajukan Sengketa',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | INFO ROW
  |--------------------------------------------------------------------------
  */

  Widget _infoRow(String label, String value, {bool mono = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              fontFamily: mono ? 'monospace' : null,
              color: const Color(0xFF1F2937),
            ),
          ),
        ),
      ],
    );
  }
}
