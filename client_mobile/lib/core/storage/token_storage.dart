// lib/core/storage/token_storage.dart

import 'package:flutter/widgets.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static final _storage = FlutterSecureStorage(
    iOptions: const IOSOptions(accessibility: KeychainAccessibility.unlocked),
  );

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  // Simpan kedua token sekaligus
  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    debugPrint(
      'TokenStorage.saveTokens -> accessToken non-null? ${accessToken.isNotEmpty}, refreshToken non-null? ${refreshToken.isNotEmpty}',
    );
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  static Future<String?> getAccessToken() async {
    final token = await _storage.read(key: _accessTokenKey);
    debugPrint('TokenStorage.getAccessToken -> $token');
    return token;
  }

  static Future<String?> getRefreshToken() async {
    final token = await _storage.read(key: _refreshTokenKey);
    debugPrint('TokenStorage.getRefreshToken -> $token');
    return token;
  }

  // Dipanggil pas logout ATAU pas refresh token gagal (dipaksa logout)
  static Future<void> clearTokens() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: 'user_id');
  }

  static Future<bool> hasToken() async {
    final token = await getAccessToken();
    return token != null;
  }

  static Future<void> saveUserId(String userId) async {
    await _storage.write(key: 'user_id', value: userId);
  }

  static Future<String?> getUserId() async {
    return await _storage.read(key: 'user_id');
  }
}
