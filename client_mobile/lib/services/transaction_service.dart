import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/core/network/api_endpoints.dart';
import 'package:client_mobile/models/transaction.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

class TransactionService {
  static Future<Map<String, dynamic>> createTransaction({
    required String judul,
    required int nominal,
    required String lawanTransaksiId, // ID unik (@ALID-xxxx)
    required String role, // 'pembeli' atau 'penjual'
    String? kontak,
    required String type, // 'simple' atau 'gateway'
  }) async {
    try {
      final response = await DioClient.dio.post(
        '/transaction',
        data: {
          'judul_barang': judul,
          'nominal': nominal,
          'role': role,
          'kontak': kontak,
          'lawan_transaksi_id': lawanTransaksiId,
          'type': type,
        },
      );

      if (response.data is Map<String, dynamic>) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } on DioException catch (e) {
      throw e.response?.data?['message'] ?? 'Gagal membuat transaksi';
    }
  }

  static Future<void> createDispute(
    String transactionId, {
    required String category,
    required String issueType,
    required String description,
    required String requestedResolution,
    List<XFile> evidenceFiles = const [],
  }) async {
    try {
      final formData = FormData.fromMap({
        'category': category,
        'issue_type': issueType,
        'description': description,
        'requested_resolution': requestedResolution,
      });

      for (final file in evidenceFiles) {
        formData.files.add(
          MapEntry(
            'evidence_files[]',
            await MultipartFile.fromFile(file.path, filename: file.name),
          ),
        );
      }

      debugPrint('========== DISPUTE REQUEST ==========');
      debugPrint('Transaction ID: $transactionId');
      debugPrint('Category: $category');
      debugPrint('Issue: $issueType');
      debugPrint('Evidence count: ${evidenceFiles.length}');
      debugPrint('Multipart files: ${formData.files.length}');

      for (final item in formData.files) {
        debugPrint('FILE FIELD: ${item.key} -> ${item.value.filename}');
      }

      final response = await DioClient.dio.post(
        ApiEndpoints.dispute(transactionId),
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
          headers: {'Accept': 'application/json'},
          sendTimeout: const Duration(seconds: 60),
          receiveTimeout: const Duration(seconds: 90),
        ),
      );

      debugPrint('========== DISPUTE SUCCESS ==========');
      debugPrint('Status: ${response.statusCode}');
      debugPrint('Response: ${response.data}');
      debugPrint('=====================================');
    } on DioException catch (e) {
      debugPrint('========== DISPUTE ERROR ==========');
      debugPrint('URL: ${e.requestOptions.uri}');
      debugPrint('Status: ${e.response?.statusCode}');
      debugPrint('Response: ${e.response?.data}');
      debugPrint('===================================');

      final responseData = e.response?.data;

      if (responseData is Map && responseData['message'] != null) {
        throw responseData['message'].toString();
      }

      throw 'Gagal mengunggah bukti sengketa.';
    }
  }

  static Future<List<AlidpayTransaction>> fetchTransactions({
    int page = 1,
    int perPage = 20,
  }) async {
    final response = await DioClient.dio.get(
      ApiEndpoints.getTransactions,
      queryParameters: {'page': page, 'per_page': perPage},
    );

    final rawData = response.data?['data'];

    if (rawData is! List) {
      throw Exception('Format daftar transaksi tidak valid');
    }

    return rawData
        .whereType<Map<String, dynamic>>()
        .map(AlidpayTransaction.fromJson)
        .toList();
  }

  static Future<AlidpayTransaction> getDetailTransactions(String id) async {
    final res = await DioClient.dio.get(ApiEndpoints.getDetailTransaction(id));

    final rawData = res.data?['transaction'] ?? res.data?['data'] ?? res.data;
    if (rawData is Map<String, dynamic>) {
      return AlidpayTransaction.fromJson(rawData);
    }
    throw Exception('Format detail transaksi tidak valid');
  }

  // 🟢 Ambil satu transaksi terbaru berdasarkan ID
  static Future<AlidpayTransaction?> fetchTransactionById(String id) async {
    final list = await fetchTransactions();
    try {
      return list.firstWhere((t) => t.id == id);
    } catch (_) {
      return null;
    }
  }

  static Future<void> markShipped(String id) async {
    await DioClient.dio.patch(ApiEndpoints.markShipped(id));
  }

  // === SIMPLE PAYMENT (tanpa payment gateway) ===
  static Future<Map<String, dynamic>> markAsPaidSimple(String trxId) async {
    final response = await DioClient.dio.patch(
      ApiEndpoints.markPaidSimple(trxId),
    );

    final body = response.data?['data'] ?? response.data;
    if (body is Map) {
      return Map<String, dynamic>.from(body);
    }
    return {};
  }

  static Future<void> confirmReceived(String id) async {
    await DioClient.dio.patch(ApiEndpoints.confirmReceived(id));
  }

  static Future<int> fetchUnseenCount() async {
    try {
      final response = await DioClient.dio.get(ApiEndpoints.unseenCount);

      if (response.data == null) return 0;

      final dynamic body = response.data;
      if (body is Map) {
        // Mendukung multi-key format: count, unseen_count, atau data.count
        final count =
            body['count'] ?? body['unseen_count'] ?? body['data']?['count'];
        if (count is num) return count.toInt();
      }

      return 0;
    } catch (_) {
      return 0;
    }
  }

  static Future<void> markSeen() async {
    await DioClient.dio.post(ApiEndpoints.markSeen);
  }

  static Future<void> konfirmasiTrx(String id) async {
    await DioClient.dio.post(ApiEndpoints.konfirmasiTransaction(id));
  }

  static Future<void> tolakTrx(String id) async {
    await DioClient.dio.post(ApiEndpoints.tolakTransaction(id));
  }
}
