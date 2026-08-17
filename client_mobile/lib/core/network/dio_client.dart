import 'package:client_mobile/core/network/api_endpoints.dart';
import 'package:client_mobile/core/storage/token_storage.dart';
import 'package:dio/dio.dart';
import 'dart:async';

import 'package:flutter/foundation.dart';

class DioClient {
  DioClient._();

  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {"Accept": "application/json"},
    ),
  );
  // Dio KHUSUS buat manggil endpoint /refresh
  // Dipisah biar gak ke-intercept lagi sama interceptor yang sama (infinite loop)
  static final Dio _refreshDio = Dio(
    BaseOptions(baseUrl: ApiEndpoints.baseUrl),
  );

  // Callback yang dipanggil pas refresh token gagal total (buat trigger navigasi ke Login di UI)
  static Function()? onSessionExpired;

  static bool _isRefreshing = false;
  static final List<void Function(String)> _pendingRequests = [];

  static void init() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Setiap request otomatis nempelin access token (kalau ada)
          final accessToken = await TokenStorage.getAccessToken();
          if (accessToken != null) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          debugPrint("========== DIO ERROR ==========");
          debugPrint("URL: ${error.requestOptions.uri}");
          debugPrint("Status: ${error.response?.statusCode}");
          debugPrint("Response: ${error.response?.data}");
          debugPrint("================================");
          final isUnauthorized = error.response?.statusCode == 401;
          final isRetry = error.requestOptions.extra['isRetry'] == true;

          // Cuma coba refresh kalau: emang 401, DAN belum pernah dicoba refresh sebelumnya
          if (isUnauthorized && !isRetry) {
            final refreshToken = await TokenStorage.getRefreshToken();

            if (refreshToken == null) {
              // Gak ada refresh token sama sekali → paksa logout
              await _forceLogout();
              return handler.next(error);
            }

            try {
              // Kalau lagi ada proses refresh jalan, request ini nunggu dulu (biar gak nembak /refresh bebarengan)
              if (_isRefreshing) {
                final completer = await _waitForRefresh();
                error.requestOptions.headers['Authorization'] =
                    'Bearer $completer';
                error.requestOptions.extra['isRetry'] = true;
                final response = await dio.fetch(error.requestOptions);
                return handler.resolve(response);
              }

              _isRefreshing = true;
              debugPrint("=== REFRESH TOKEN DIMULAI ===");
              final refreshResponse = await _refreshDio.post(
                ApiEndpoints
                    .refresh, // sesuaikan path endpoint lu, misal '/refresh'
                data: {'refresh_token': refreshToken},
              );
              debugPrint("=== REFRESH BERHASIL ===");
              debugPrint(refreshResponse.data.toString());
              debugPrint(refreshResponse.data.runtimeType.toString());

              debugPrint(
                refreshResponse.data['access_token'].runtimeType.toString(),
              );

              debugPrint(
                refreshResponse.data['refresh_token'].runtimeType.toString(),
              );

              final newAccessToken =
                  refreshResponse.data['access_token'] as String?;
              final newRefreshToken =
                  refreshResponse.data['refresh_token'] as String?;

              if (newAccessToken == null || newRefreshToken == null) {
                throw Exception('Token refresh failed: missing tokens');
              }

              await TokenStorage.saveTokens(
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              );

              debugPrint("1. SAVE TOKEN SELESAI");

              _isRefreshing = false;

              debugPrint("2. notify pending");
              _notifyPendingRequests(newAccessToken);

              debugPrint("3. set header");
              error.requestOptions.headers['Authorization'] =
                  'Bearer $newAccessToken';

              debugPrint("4. retry request");
              error.requestOptions.extra['isRetry'] = true;

              final response = await dio.fetch(error.requestOptions);

              debugPrint("5. retry success");

              return handler.resolve(response);
            } catch (e, s) {
              debugPrint("=== REFRESH GAGAL ===");
              debugPrint(e.toString());
              debugPrint(s.toString());

              _isRefreshing = false;
              await _forceLogout();
              return handler.next(error);
            }
          }

          return handler.next(error);
        },
      ),
    );
  }

  static Future<String> _waitForRefresh() {
    final completer = Completer<String>();
    _pendingRequests.add((token) => completer.complete(token));
    return completer.future;
  }

  static void _notifyPendingRequests(String newToken) {
    for (final callback in _pendingRequests) {
      callback(newToken);
    }
    _pendingRequests.clear();
  }

  static Future<void> _forceLogout() async {
    await TokenStorage.clearTokens();
    onSessionExpired?.call(); // trigger navigasi paksa ke LoginScreen
  }
}
