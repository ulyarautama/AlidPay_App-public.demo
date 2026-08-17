import 'package:flutter/widgets.dart';

import 'auth_api.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthRepository {
  final AuthApi api;

  AuthRepository(this.api);

  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  /// Jembatan Login Manual
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String role,
  }) async {
    return await api.login(email: email, password: password, role: role);
  }

  // 🔥 REPO CEK EMAIL + PROVIDER
  Future<Map<String, dynamic>> checkEmailProvider({
    required String email,
  }) async {
    return await api.checkEmailProvider(email: email);
  }

  Future<Map<String, dynamic>> checkName({
    required String name,
  }) async {
    return await api.checkName(name: name);
  }

  /// Memunculkan Pop-up Google Auth
  Future<GoogleSignInAccount?> signInWithGoogle() async {
    try {
      await _googleSignIn.initialize(
        serverClientId:
            '416148718034-a8ja3rrdfnkmnnb4240n11ct5alebilm.apps.googleusercontent.com',
      );
      final GoogleSignInAccount account = await _googleSignIn.authenticate();
      return account;
    } catch (error, stackTrace) {
      if (error is GoogleSignInException &&
          error.code == GoogleSignInExceptionCode.canceled) {
        debugPrint(
          'Google Sign-In dibatalkan. Detail: '
          '${error.description ?? 'tanpa deskripsi'}',
        );
        return null;
      }

      final errorText = error is GoogleSignInException
          ? '${error.code.name}: ${error.description ?? error}'
          : error.toString();

      debugPrint('Google Sign-In gagal: $errorText');
      debugPrintStack(stackTrace: stackTrace);

      throw StateError(
        'Google Sign-In gagal. Detail: $errorText',
      );
    }
  }

  /// 🔥 JEMBATAN EMAS: Mengirimkan email dan token dari Google ke class AuthApi
  Future<Map<String, dynamic>> loginGoogleToBackend({
    required String id,
    required String name,
    required String email,
    required String role,
  }) async {
    // Dipanggil lewat objek 'authApi' yang sudah di-inject di constructor atas
    return await api.loginGoogleToBackend(
      id: id,
      name: name,
      email: email,
      role: role,
    );
  }

  Future register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) {
    return api.register(
      name: name,
      email: email,
      password: password,
      role: role,
    );
  }

  // 🔥 REPO CEK EMAIL EXISTS
  Future<bool> checkEmailExists({required String email}) async {
    return await api.checkEmailExists(email: email);
  }

  // 🔥 REPO VERIFY OTP
  Future<Map<String, dynamic>?> verifyOtp({
    required String email,
    required String code,
  }) async {
    final result = await api.verifyOtp(email: email, code: code);
    return result;
  }

  // 🔥 REPO RESEND OTP
  Future<Map<String, dynamic>?> resendOtp({required String email}) async {
    final result = await api.resendOtp(email: email);
    return result;
  }
}
