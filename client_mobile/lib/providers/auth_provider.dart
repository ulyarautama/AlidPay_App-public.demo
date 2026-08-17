import 'package:client_mobile/core/storage/token_storage.dart';
import 'package:client_mobile/services/websocket_service.dart'; // 1. IMPORT SERVICE WEBSOCKET LU
import 'package:flutter/material.dart';

// Buat model sederhana untuk menampung data user
class UserModel {
  final String id;
  final String publicId;
  final String name;
  final String email;
  final String role;
  final String? phone;

  UserModel({
    required this.id,
    required this.publicId,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final data = json["user"] ?? json;
    final publicId = data["public_id"] ?? data["publicId"] ?? data["id"];

    return UserModel(
      id: data["id"].toString(),
      publicId: publicId?.toString() ?? '',
      name: data["name"].toString(),
      email: data["email"].toString(),
      role: data["role"].toString(),
      phone: data["phone"]?.toString(),
    );
  }
}

// Ini adalah AuthProvider-nya
class AuthProvider with ChangeNotifier {
  UserModel? _user;
  UserModel? get user => _user;

  static VoidCallback? onLoggedOut;
  bool justLoggedOut = false;

  // 2. UBAH JADI ASYNC BIAR BISA NGAMBIL TOKEN DARI STORAGE
  Future<void> setUser(UserModel user) async {
    _user = user;

    try {
      // Ambil token aktif untuk koneksi WebSocket Reverb
      final storedToken = await TokenStorage.getAccessToken();
      if (storedToken != null) {
        // AKSI REALTIME: Inisialisasi koneksi WebSocket saat user diset (Login/App Start)
        WebSocketService.init(storedToken, user.id);
      }
    } catch (e) {
      debugPrint("Gagal menginisialisasi WebSocket: $e");
    }

    notifyListeners();
  }

  // Fungsi untuk logout (menghapus data user dari state)
  Future<void> logout() async {
    try {
      // AKSI REALTIME: Putus koneksi WebSocket sebelum token dihapus
      WebSocketService.disconnect();

      await TokenStorage.clearTokens();
      _user = null;

      justLoggedOut = true;
      notifyListeners();

      onLoggedOut?.call();
    } catch (e) {
      debugPrint("Gagal logout: $e");
    }
  }
}
