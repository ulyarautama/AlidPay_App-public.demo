import 'package:client_mobile/core/storage/token_storage.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

class AuthApi {
  /// Login secara manual menggunakan email & password
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final response = await DioClient.dio.post(
        ApiEndpoints.login,
        data: {"email": email, "password": password, "role": role},
      );

      // 🟢 FIX: Simpan token, sama kayak register() & loginGoogleToBackend()
      final atResp = response.data['access_token'] as String?;
      final rtResp = response.data['refresh_token'] as String?;
      if (atResp != null && rtResp != null) {
        await TokenStorage.saveTokens(
          accessToken: atResp,
          refreshToken: rtResp,
        );
        await TokenStorage.saveUserId(response.data['user']['id']);
      }

      final at = await TokenStorage.getAccessToken();
      final rt = await TokenStorage.getRefreshToken();
      debugPrint("ACCESS TOKEN: $at");
      debugPrint("REFRESH TOKEN: $rt");

      debugPrint(response.data['message'].toString());
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        debugPrint("DETAIL ERROR SERVER: ${e.response?.data}");
        debugPrint("STATUS CODE: ${e.response?.statusCode}");
      } else {
        debugPrint("ERROR TANPA RESPONSE: ${e.message}");
      }
      rethrow;
    }
  }

  /// Verifikasi Token Google ke Backend AlidPay
  Future<Map<String, dynamic>> loginGoogleToBackend({
    required String id,
    required String name,
    required String email,
    required String role,
  }) async {
    try {
      final response = await DioClient.dio.post(
        ApiEndpoints.googleLogin,
        data: {'name': name, 'id': id, 'email': email, 'role': role},
      );
      final atResp = response.data['access_token'] as String?;
      final rtResp = response.data['refresh_token'] as String?;
      if (atResp != null && rtResp != null) {
        await TokenStorage.saveTokens(
          accessToken: atResp,
          refreshToken: rtResp,
        );
        await TokenStorage.saveUserId(response.data['user']['id']);
      }
      final at = await TokenStorage.getAccessToken();
      final rt = await TokenStorage.getRefreshToken();
      debugPrint("ACCESS TOKEN: $at");
      debugPrint("REFRESH TOKEN: $rt");

      debugPrint("BACKEND GOOGLE LOGIN RESPONSE: ${response.data}");
      return response.data;
    } on DioException catch (e) {
      // PENTING: Cetak response data dari server di sini
      if (e.response != null) {
        debugPrint("DETAIL ERROR SERVER: ${e.response?.data}");
        debugPrint("STATUS CODE: ${e.response?.statusCode}");
      } else {
        debugPrint("ERROR TANPA RESPONSE: ${e.message}");
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> checkName({required String name}) async {
    final response = await DioClient.dio.post(
      ApiEndpoints.checkName, // pakai constant yang lo kasih: '/check-name'
      data: {'name': name},
    );
    return {'exists': response.data['exists'] as bool? ?? false};
  }

  // 🔥 CEK EMAIL EXISTS + AUTH PROVIDER-NYA (manual/google)
  Future<Map<String, dynamic>> checkEmailProvider({
    required String email,
  }) async {
    try {
      final response = await DioClient.dio.post(
        ApiEndpoints.checkEmailProvider,
        data: {"email": email},
      );
      return {
        'exists': response.data['exists'] as bool? ?? false,
        'authProvider': response.data['auth_provider'] as String?,
      };
    } on DioException catch (e) {
      if (e.response != null) {
        debugPrint("DETAIL ERROR SERVER: ${e.response?.data}");
        debugPrint("STATUS CODE: ${e.response?.statusCode}");
      } else {
        debugPrint("ERROR TANPA RESPONSE: ${e.message}");
      }
      // 🟢 Kalau gagal cek, anggap aman aja biar gak nge-block user
      return {'exists': false, 'authProvider': null};
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final response = await DioClient.dio.post(
        ApiEndpoints.register,
        data: {
          "name": name,
          "email": email,
          "password": password,
          "role": role,
        },
      );
      final atResp = response.data['access_token'] as String?;
      final rtResp = response.data['refresh_token'] as String?;
      if (atResp != null && rtResp != null) {
        await TokenStorage.saveTokens(
          accessToken: atResp,
          refreshToken: rtResp,
        );
        await TokenStorage.saveUserId(response.data['user']['id']);
      }
      final at = await TokenStorage.getAccessToken();
      final rt = await TokenStorage.getRefreshToken();
      debugPrint("ACCESS TOKEN: $at");
      debugPrint("REFRESH TOKEN: $rt");

      debugPrint(response.data.toString());
      return response.data;
    } on DioException catch (e) {
      // PENTING: Cetak response data dari server di sini
      if (e.response != null) {
        debugPrint("DETAIL ERROR SERVER: ${e.response?.data}");
        debugPrint("STATUS CODE: ${e.response?.statusCode}");
      } else {
        debugPrint("ERROR TANPA RESPONSE: ${e.message}");
      }
      rethrow;
    }
  }

  // 🔥 CEK APAKAH EMAIL SUDAH TERDAFTAR DI DATABASE
  Future<bool> checkEmailExists({required String email}) async {
    try {
      final response = await DioClient.dio.post(
        ApiEndpoints.checkEmail,
        data: {"email": email},
      );
      return response.data['exists'] as bool? ?? false;
    } on DioException catch (e) {
      if (e.response != null) {
        debugPrint("DETAIL ERROR SERVER: ${e.response?.data}");
        debugPrint("STATUS CODE: ${e.response?.statusCode}");
      } else {
        debugPrint("ERROR TANPA RESPONSE: ${e.message}");
      }
      // 🟢 Kalau gagal cek (misal network error), anggap aman aja
      // biar gak nge-block user daftar gara-gara koneksi bermasalah
      return false;
    }
  }

  // 🔥 SEND / VERIFY OTP KE BACKEND
  Future<Map<String, dynamic>?> verifyOtp({
    required String email,
    required String code,
  }) async {
    try {
      final response = await DioClient.dio.post(
        ApiEndpoints.verifyOtp,
        data: {"email": email, "code": code},
      );
      final atResp = response.data['access_token'] as String?;
      final rtResp = response.data['refresh_token'] as String?;
      if (atResp != null && rtResp != null) {
        await TokenStorage.saveTokens(
          accessToken: atResp,
          refreshToken: rtResp,
        );
        await TokenStorage.saveUserId(response.data['user']['id']);
      }
      final at = await TokenStorage.getAccessToken();
      final rt = await TokenStorage.getRefreshToken();
      debugPrint("ACCESS TOKEN: $at");
      debugPrint("REFRESH TOKEN: $rt");

      return response.data;
    } on DioException catch (e) {
      final serverMessage = e.response?.data?['message'];
      throw serverMessage ?? 'Gagal memverifikasi OTP.';
    }
  }

  // 🔥 RESEND OTP KE BACKEND
  Future<Map<String, dynamic>?> resendOtp({required String email}) async {
    try {
      final response = await DioClient.dio.post(
        ApiEndpoints.resendOtp,
        data: {"email": email},
      );

      return response.data;
    } on DioException catch (e) {
      final serverMessage = e.response?.data?['message'];
      throw serverMessage ?? 'Gagal mengirim ulang OTP.';
    }
  }
}
