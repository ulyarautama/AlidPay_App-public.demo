import 'auth_provider.dart'; // Import UserModel yang kita buat sebelumnya

class AuthResponse {
  final String token;
  final UserModel user; // <--- Nah, usernya ada di dalam sini!

  AuthResponse({required this.token, required this.user});

  // Fungsi untuk mengubah JSON dari API menjadi Object AuthResponse
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] ?? '',
      // Menyesuaikan dengan struktur JSON dari backend kamu,
      // misal datanya dibungkus di dalam key 'user' atau 'data'
      user: UserModel.fromJson(json['user'] ?? {}),
    );
  }
}
