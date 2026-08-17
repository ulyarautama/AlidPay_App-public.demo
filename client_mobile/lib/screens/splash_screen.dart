// lib/screens/splash_screen.dart
import 'package:client_mobile/core/network/api_endpoints.dart';
import 'package:client_mobile/core/network/dio_client.dart';
import 'package:client_mobile/core/storage/token_storage.dart';
import 'package:client_mobile/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    debugPrint('SplashScreen start');
    final accessToken = await TokenStorage.getAccessToken();
    final refreshToken = await TokenStorage.getRefreshToken();
    debugPrint(
      'SplashScreen token read access=$accessToken refresh=$refreshToken',
    );

    if (accessToken == null || refreshToken == null) {
      debugPrint('SplashScreen no token -> go to login');
      _goToLogin();
      return;
    }

    try {
      final response = await DioClient.dio.get(ApiEndpoints.me);

      final user = UserModel.fromJson(response.data);

      if (!mounted) return;

      //  UBAH DI SINI: Tambahkan 'await' karena setUser sekarang bersifat asynchronous
      await context.read<AuthProvider>().setUser(user);

      _goToRoleDashboard(user.role);
    } catch (e, s) {
      debugPrint(e.toString());
      debugPrint(s.toString());

      // sementara jangan clear token dulu
      _goToLogin();
    }
  }

  void _goToRoleDashboard(String role) {
    switch (role) {
      case 'penjual':
        Navigator.pushReplacementNamed(context, '/seller-dashboard');
        break;
      case 'pembelian':
      default:
        Navigator.pushReplacementNamed(context, '/buyer-dashboard');
        break;
    }
  }

  void _goToLogin() {
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFF8F5FF), Color(0xFFFDF2F8)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(
                      Icons.lock_outline_rounded,
                      color: Color(0xFF8B5CF6),
                      size: 30,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'AlidPay',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Memuat akun Anda...',
                    style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                  ),
                  const SizedBox(height: 18),
                  const CircularProgressIndicator(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
