import 'package:flutter/cupertino.dart';

import '../data/auth_repository.dart';

class LoginController {
  final AuthRepository repository;

  LoginController(this.repository);

  /// Login Manual menggunakan Email & Password
  Future login({required String email, required String password, required String role }) async {
    try {
      final result = await repository.login(email: email, password: password, role: role);
      return result;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> checkEmailProvider({
    required String email,
  }) async {
    try {
      return await repository.checkEmailProvider(email: email);
    } catch (e) {
      return {'exists': false};
    }
  }

  /// Login otomatis menggunakan Google Pop-up
  Future<Map<String, dynamic>?> loginWithGoogle({required String role}) async {
    try {
      // 1. Pemicu pop-up login Google lewat repository
      final googleUser = await repository.signInWithGoogle();

      // Jika user sukses memilih akun Google
      if (googleUser != null) {
        // Ambil data autentikasi dari akun Google tersebut
        final String id = googleUser.id;
        final String name = googleUser.displayName ?? "No Name";
        final String email = googleUser.email;

        debugPrint("=== DATA GOOGLE LOGIN ===");
        debugPrint("Name: $name");
        debugPrint("Email: $email");
        debugPrint("Photo URL: ${googleUser.photoUrl}");
        debugPrint("ID Token: ${googleUser.id}");
        debugPrint("=========================");

        // 2. Dipanggil lewat objek repository, bukan lewat Class 'AuthApi' langsung
        final backendResponse = await repository.loginGoogleToBackend(
          id: id,
          name: name,
          email: email,
          role: role,
        );

        return backendResponse; // Mengembalikan response sukses dari Backend (Role, Token, dll)
      }

      return null; // User membatalkan login (menekan tombol back)
    } catch (e) {
      debugPrint("Error di LoginController: $e");
      rethrow;
    }
  }
}
