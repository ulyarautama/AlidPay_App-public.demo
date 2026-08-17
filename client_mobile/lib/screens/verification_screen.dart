import 'package:client_mobile/features/auth/data/auth_api.dart';
import 'package:client_mobile/features/auth/data/auth_repository.dart';
import 'package:client_mobile/features/auth/register/register_controller.dart';
import 'package:client_mobile/screens/buyer_dashboard.dart';
import 'package:client_mobile/screens/seller_dashboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'dart:ui';

import 'package:client_mobile/providers/auth_provider.dart';
import 'package:provider/provider.dart';

import '../features/auth/widgets/auth_button.dart';

class VerificationScreen extends StatefulWidget {
  final String name;
  final String email;
  final String password;
  final String role;

  const VerificationScreen({
    super.key,
    required this.name,
    required this.email,
    required this.password,
    required this.role,
  });

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  // 4 Controller untuk masing-masing kotak angka OTP
  late final RegisterController controller;

  final List<TextEditingController> _controllers = List.generate(
    4,
    (_) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  bool isLoading = false;

  // Timer untuk Kirim Ulang Kode
  Timer? _timer;
  int _startSeconds = 60;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    // Inisialisasi controller senada dengan RegisterScreen
    controller = RegisterController(AuthRepository(AuthApi()));
    _startTimer();
  }

  void _startTimer() {
    _canResend = false;
    _startSeconds = 60;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_startSeconds == 0) {
        setState(() {
          _canResend = true;
          _timer?.cancel();
        });
      } else {
        setState(() {
          _startSeconds--;
        });
      }
    });
  }

  // Cek apakah ke-4 kotak OTP sudah terisi semua
  bool get isOtpComplete {
    return _controllers.every((controller) => controller.text.isNotEmpty);
  }

  String get otpCode {
    return _controllers.map((controller) => controller.text).join();
  }

  void _resendOtp() async {
    if (!_canResend) return;

    try {
      // 🔥 PANGGIL REPO/API LIVE!
      final response = await controller.resendOtp(email: widget.email);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response?['message'] ?? 'OTP berhasil dikirim ulang!'),
          backgroundColor: const Color(0xFF10B981), // Warna ijo sukses
        ),
      );

      _startTimer(); // Reset ulang timer ke 60 detik
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF8B5CF6);
    const textColorDark = Color(0xFF1F2937);
    const textColorMuted = Color(0xFF6B7280);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFEDE9FE), Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              // --- 🎨 DEKORASI BACKGROUND ART (Biar Senada) ---
              Positioned(
                top: -40,
                right: -40,
                child: Container(
                  width: 220,
                  height: 220,
                  decoration: BoxDecoration(
                    color: primaryColor.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              Positioned(
                bottom: -20,
                left: -20,
                child: Icon(
                  Icons.mark_email_read_rounded,
                  size: 180,
                  color: primaryColor.withValues(alpha: 0.06),
                ),
              ),

              // --- KONTEN UTAMA ---
              Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Tombol Kembali
                      Row(
                        children: [
                          IconButton(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(
                              Icons.arrow_back_ios_new_rounded,
                              size: 18,
                              color: textColorMuted,
                            ),
                          ),
                          const Text(
                            "Kembali",
                            style: TextStyle(
                              color: textColorMuted,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Judul
                      const Text(
                        "Verifikasi",
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w900,
                          color: textColorDark,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const Text(
                        "Email Anda",
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w900,
                          color: primaryColor,
                          letterSpacing: -0.5,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Informasi Email Target
                      Text.rich(
                        TextSpan(
                          text:
                              "Kami telah mengirimkan kode OTP 4-digit ke alamat email ",
                          style: const TextStyle(
                            color: textColorMuted,
                            fontSize: 14,
                            height: 1.4,
                          ),
                          children: [
                            TextSpan(
                              text: widget.email,
                              style: const TextStyle(
                                color: textColorDark,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const TextSpan(
                              text: ". Masukkan kode tersebut di bawah ini.",
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),

                      // 💎 GLASSMORPHISM FORM OTP CARD 💎
                      ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.45),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.6),
                                width: 1.5,
                              ),
                            ),
                            child: Column(
                              children: [
                                // --- 🔢 ROW INPUT OTP 4 DIGIT ---
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceEvenly,
                                  children: List.generate(4, (index) {
                                    return SizedBox(
                                      width: 60,
                                      height: 60,
                                      child: TextField(
                                        controller: _controllers[index],
                                        focusNode: _focusNodes[index],
                                        onChanged: (value) {
                                          if (value.isNotEmpty && index < 3) {
                                            _focusNodes[index + 1]
                                                .requestFocus();
                                          }
                                          if (value.isEmpty && index > 0) {
                                            _focusNodes[index - 1]
                                                .requestFocus();
                                          }
                                          setState(
                                            () {},
                                          ); // Trigger refresh state tombol daftar
                                        },
                                        keyboardType: TextInputType.number,
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.bold,
                                          color: textColorDark,
                                        ),
                                        inputFormatters: [
                                          LengthLimitingTextInputFormatter(1),
                                          FilteringTextInputFormatter
                                              .digitsOnly,
                                        ],
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: Colors.white.withValues(
                                            alpha: 0.8,
                                          ),
                                          contentPadding: EdgeInsets.zero,
                                          enabledBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(
                                              14,
                                            ),
                                            borderSide: BorderSide(
                                              color: primaryColor.withValues(
                                                alpha: 0.2,
                                              ),
                                            ),
                                          ),
                                          focusedBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(
                                              14,
                                            ),
                                            borderSide: const BorderSide(
                                              color: primaryColor,
                                              width: 2,
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  }),
                                ),
                                const SizedBox(height: 24),

                                // --- ⏱️ COUNTDOWN / RESEND OTP TAUTAN ---
                                Wrap(
                                  alignment: WrapAlignment.center,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  runSpacing:
                                      4, // Kalau gak muat, baris kedua otomatis turun 4 pixel
                                  children: [
                                    const Text(
                                      "Tidak menerima kode? ",
                                      style: TextStyle(
                                        color: textColorMuted,
                                        fontSize: 13,
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: _canResend ? _resendOtp : null,
                                      child: Text(
                                        _canResend
                                            ? "Kirim Ulang"
                                            : "Kirim ulang dalam ${_startSeconds}s",
                                        style: TextStyle(
                                          color: _canResend
                                              ? primaryColor
                                              : textColorMuted,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13,
                                          decoration: _canResend
                                              ? TextDecoration.underline
                                              : null,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Tombol Verfikasi Akun
                      // Tombol Verifikasi Akun
                      AuthButton(
                        text: "Verifikasi Akun",
                        isLoading: isLoading,
                        onPressed: isOtpComplete
                            ? () async {
                                setState(() => isLoading = true);
                                try {
                                  debugPrint(
                                    "Memulai proses verifikasi OTP untuk: ${widget.email}",
                                  );

                                  final authResult = await controller.verifyOtp(
                                    email: widget.email,
                                    code: otpCode,
                                  );

                                  if (!context.mounted) return;
                                  if (authResult != null) {
                                    debugPrint(authResult.toString());
                                    // 1. Ambil data user dari JSON utuh backend
                                    final userData = authResult['user'];

                                    // 2. Convert dan masukkan ke AuthProvider
                                    final userModel = UserModel.fromJson(
                                      userData,
                                    );
                                    Provider.of<AuthProvider>(
                                      context,
                                      listen: false,
                                    ).setUser(userModel);

                                    // 4. Baru lakukan redirect sesuai role
                                    if (widget.role == "penjual") {
                                      Navigator.pushAndRemoveUntil(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              const SellerDashboard(),
                                        ),
                                        (route) => false,
                                      );
                                    } else if (widget.role == "pembeli") {
                                      Navigator.pushAndRemoveUntil(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              const BuyerDashboard(),
                                        ),
                                        (route) => false,
                                      );
                                    }
                                  }
                                } catch (e, stackTrace) {
                                  // MEMAKSA ERROR MUNCUL DI FLUTTER DEBUG CONSOLE
                                  debugPrint(
                                    "ERROR TERDETEKSI DI UI VERIFIKASI:",
                                  );
                                  debugPrint(e.toString());
                                  debugPrint(stackTrace.toString());

                                  if (!mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(e.toString()),
                                      backgroundColor: const Color(0xFFEF4444),
                                    ),
                                  );
                                } finally {
                                  if (mounted) {
                                    setState(() => isLoading = false);
                                  }
                                }
                              }
                            : null,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
