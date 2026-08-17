class TransactionUser {
  final String id;
  final String publicId;
  final String name;

  TransactionUser({
    required this.id,
    required this.publicId,
    required this.name,
  });

  factory TransactionUser.fromJson(Map<String, dynamic> json) {
    return TransactionUser(
      id: json['id'].toString(),
      publicId: json['public_id'].toString(),
      name: json['name'].toString(),
    );
  }
}

enum AlidpayStatus {
  draftLink,
  menungguKonfirmasi, // transaksi baru dibuat, nunggu lawan konfirmasi
  menungguPembayaran, // buyer belum bayar
  danaDitahan, // duit masuk ke Alidpay, nunggu seller kirim barang
  barangDikirim, // seller udah kirim, nunggu konfirmasi buyer
  danaDicairkan, // selesai, duit cair ke seller
  sengketa, // dispute / komplain
  dibatalkan,
}

extension AlidpayStatusX on AlidpayStatus {
  String get label {
    switch (this) {
      case AlidpayStatus.draftLink:
        return 'Menunggu Pembayaran - Menunggu Konfirmasi';
      case AlidpayStatus.menungguKonfirmasi:
        return 'Menunggu Konfirmasi';
      case AlidpayStatus.menungguPembayaran:
        return 'Menunggu Pembayaran';
      case AlidpayStatus.danaDitahan:
        return 'Dana Diamankan';
      case AlidpayStatus.barangDikirim:
        return 'Barang Dikirim';
      case AlidpayStatus.danaDicairkan:
        return 'Dana Dicairkan';
      case AlidpayStatus.sengketa:
        return 'Sedang Ditinjau';
      case AlidpayStatus.dibatalkan:
        return 'Dibatalkan';
    }
  }

  // Konversi dari string status yang dikirim backend (snake_case)
  static AlidpayStatus fromApiString(String value) {
    switch (value) {
      case 'draft_link': // ⬅️ INI HARUS ADA
        return AlidpayStatus.draftLink;
      case 'menunggu_konfirmasi':
        return AlidpayStatus.menungguKonfirmasi;
      case 'menunggu_pembayaran':
        return AlidpayStatus.menungguPembayaran;
      case 'dana_ditahan':
        return AlidpayStatus.danaDitahan;
      case 'barang_dikirim':
        return AlidpayStatus.barangDikirim;
      case 'dana_dicairkan':
        return AlidpayStatus.danaDicairkan;
      case 'sengketa':
        return AlidpayStatus.sengketa;
      case 'dibatalkan':
        return AlidpayStatus.dibatalkan;
      default:
        return AlidpayStatus.menungguPembayaran;
    }
  }
}

class AlidpayTransaction {
  final String id;
  final String judulBarang;
  final String createdBy;
  final TransactionUser buyer;
  final TransactionUser seller;
  final int nominal;
  final int feeAlidpay;
  final AlidpayStatus status;
  final String type;
  final String? kontakPenjual;
  final bool isSeenByBuyer;
  final bool isSeenBySeller;
  final DateTime tanggal;
  final ConfirmationStatus confirmationStatus;

  AlidpayTransaction({
    required this.confirmationStatus,
    required this.id,
    required this.judulBarang,
    required this.createdBy,
    required this.buyer,
    required this.seller,
    required this.nominal,
    required this.feeAlidpay,
    required this.status,
    required this.type,
    required this.isSeenByBuyer,
    required this.isSeenBySeller,
    required this.tanggal,
    this.kontakPenjual,
  });

  int get totalDiterimaPenjual => nominal - feeAlidpay;

  // Kompatibilitas dengan UI lama yang masih pakai "penjual"/"pembeli" sebagai String nama
  String get penjual => seller.name;
  String get pembeli => buyer.name;

  factory AlidpayTransaction.fromJson(Map<String, dynamic> json) {
    return AlidpayTransaction(
      id: json['id'].toString(),
      judulBarang: json['judul_barang'].toString(),
      createdBy: json['created_by'].toString(),
      buyer: json['buyer'] != null
          ? TransactionUser.fromJson(json['buyer'])
          : TransactionUser(id: '', publicId: '-', name: 'Menunggu Pembeli'),
      seller: json['seller'] != null
          ? TransactionUser.fromJson(json['seller'])
          : TransactionUser(id: '', publicId: '-', name: 'Menunggu Penjual'),
      nominal: json['nominal'] is String
          ? int.parse(json['nominal'])
          : json['nominal'],
      feeAlidpay: json['fee'] is String
          ? int.parse(json['fee'])
          : (json['fee'] as num).toInt(),
      status: AlidpayStatusX.fromApiString(json['status'].toString()),
      type: json['type']?.toString() ?? 'normal',
      confirmationStatus: ConfirmationStatusX.fromApiString(
        json['confirmation_status']?.toString(),
      ),
      kontakPenjual: json['kontak_penjual']?.toString(),
      isSeenByBuyer: json['is_seen_by_buyer'] == true,
      isSeenBySeller: json['is_seen_by_seller'] == true,
      tanggal: DateTime.parse(json['created_at'].toString()),
    );
  }
}

enum ConfirmationStatus {
  pending, // baru masuk, nunggu seller/buyer konfirmasi
  confirmed, // udah dikonfirmasi, transaksi lanjut jalan
  rejected, // ditolak salah satu pihak
}

extension ConfirmationStatusX on ConfirmationStatus {
  static ConfirmationStatus fromApiString(String? value) {
    switch (value) {
      case 'confirmed':
        return ConfirmationStatus.confirmed;
      case 'rejected':
        return ConfirmationStatus.rejected;
      case 'pending':
      default:
        return ConfirmationStatus.pending;
    }
  }
}
