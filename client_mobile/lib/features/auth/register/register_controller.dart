import '../data/auth_repository.dart';

class RegisterController {
  final AuthRepository repository;

  RegisterController(this.repository);

  Future<bool> checkEmailExists({required String email}) async {
    try {
      return await repository.checkEmailExists(email: email);
    } catch (e) {
      // 🟢 Kalau error pas cek, jangan block user — anggap belum terdaftar
      return false;
    }
  }

  Future<bool> checkNameExists({required String name}) async {
    try {
      final result = await repository.checkName(name: name);
      return result['exists'] as bool? ?? false;
    } catch (e) {
      return false;
    }
  }

  Future register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final result = await repository.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );

      return result['message'] as String? ??
          'Pendaftaran berhasil, silahkan cek OTP';
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>?> verifyOtp({
    required String email,
    required String code,
  }) async {
    try {
      // Hit repository lu ke API backend
      final result = await repository.verifyOtp(email: email, code: code);
      return result; // Mengembalikan pesan sukses dari BE
    } catch (e) {
      // Lempar error biar ditangkap sama UI `try-catch`
      throw e.toString().replaceAll('Exception: ', '');
    }
  }

  // 🔥 2. FUNGSI KIRIM ULANG OTP
  Future<Map<String, dynamic>?> resendOtp({required String email}) async {
    try {
      final result = await repository.resendOtp(email: email);
      return result;
    } catch (e) {
      throw e.toString().replaceAll('Exception: ', '');
    }
  }
}
