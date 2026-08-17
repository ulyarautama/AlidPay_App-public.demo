import 'dart:async';
import 'package:client_mobile/providers/auth_provider.dart';
import 'package:client_mobile/screens/main_nav_screen.dart';
import 'package:client_mobile/screens/register_screen.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../features/auth/widgets/auth_button.dart';
import '../features/auth/widgets/auth_text_field.dart';
import '../features/auth/login/login_controller.dart';
import '../features/auth/data/auth_repository.dart';
import '../features/auth/data/auth_api.dart';
import 'role_select_screen.dart'; // pakai AlidColors dari sini

class LoginScreen extends StatefulWidget {
  final String role;
  const LoginScreen({super.key, required this.role});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  bool obscure = true;
  bool isLoading = false;

  Timer? _emailDebounce;
  bool _isCheckingEmail = false;
  String? _emailAuthProvider;
  String? _lastCheckedEmail;

  bool get _emailIsGoogleOnly =>
      _emailAuthProvider == 'google' &&
      emailController.text.trim().toLowerCase() == _lastCheckedEmail;

  bool get isFormValid {
    return emailController.text.trim().isNotEmpty &&
        passwordController.text.isNotEmpty &&
        !_emailIsGoogleOnly;
  }

  late final LoginController controller;

  bool isValidEmail(String email) {
    return RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  @override
  void initState() {
    super.initState();
    controller = LoginController(AuthRepository(AuthApi()));
    emailController.addListener(_onEmailChanged);
    passwordController.addListener(_onChanged);
  }

  void _onChanged() => setState(() {});

  void _onEmailChanged() {
    setState(() {});
    final email = emailController.text.trim().toLowerCase();
    _emailDebounce?.cancel();

    if (!isValidEmail(email)) {
      setState(() {
        _emailAuthProvider = null;
        _lastCheckedEmail = null;
        _isCheckingEmail = false;
      });
      return;
    }

    _emailDebounce = Timer(const Duration(milliseconds: 600), () async {
      setState(() => _isCheckingEmail = true);
      final result = await controller.checkEmailProvider(email: email);
      if (!mounted) return;

      final exists = result['exists'] as bool? ?? false;
      final authProvider = result['authProvider'] as String?;

      setState(() {
        _emailAuthProvider = exists ? authProvider : null;
        _lastCheckedEmail = email;
        _isCheckingEmail = false;
      });
    });
  }

  @override
  void dispose() {
    _emailDebounce?.cancel();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AlidColors.wine,
      body: SafeArea(
        bottom: false,
        child: SizedBox.expand(
          child: Stack(
            children: [
              _brandHeader(context),
              Positioned.fill(
                top: 168,
                child: Container(
                  decoration: const BoxDecoration(
                    color: AlidColors.cream,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(32),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x33000000),
                        blurRadius: 24,
                        offset: Offset(0, -6),
                      ),
                    ],
                  ),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(28, 30, 28, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: AlidColors.line,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        Text(
                          'MASUK KE AKUN',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2.2,
                            color: AlidColors.stone,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.role == 'penjual'
                              ? 'Masuk sebagai penjual'
                              : 'Masuk sebagai pembeli',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: AlidColors.wine,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // --- FORM: tanpa card, dipisah garis tipis ---
                        AuthTextField(
                          hint: "Alamat Email",
                          icon: Icons.email_outlined,
                          controller: emailController,
                          keyboardType: TextInputType.emailAddress,
                        ),

                        if (emailController.text.trim().isNotEmpty) ...[
                          if (_isCheckingEmail)
                            Padding(
                              padding: const EdgeInsets.only(top: 10, left: 4),
                              child: Row(
                                children: [
                                  const SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AlidColors.stone,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    "Mengecek email...",
                                    style: GoogleFonts.plusJakartaSans(
                                      color: AlidColors.stone,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else if (_emailIsGoogleOnly)
                            Padding(
                              padding: const EdgeInsets.only(top: 10, left: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(
                                    Icons.info_rounded,
                                    size: 15,
                                    color: AlidColors.gold,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      "Email ini sudah digunakan login Google. Silakan lanjutkan dengan Google.",
                                      style: GoogleFonts.plusJakartaSans(
                                        color: AlidColors.wineSoft,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],

                        const SizedBox(height: 20),
                        Container(height: 1, color: AlidColors.line),
                        const SizedBox(height: 20),

                        AuthTextField(
                          hint: "Kata Sandi",
                          icon: Icons.lock_outline_rounded,
                          controller: passwordController,
                          obscureText: obscure,
                          suffixIcon: IconButton(
                            onPressed: () => setState(() => obscure = !obscure),
                            icon: Icon(
                              obscure
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: AlidColors.stone,
                              size: 20,
                            ),
                          ),
                        ),

                        const SizedBox(height: 36),

                        AuthButton(
                          text: "Masuk Sekarang",
                          isLoading: isLoading,
                          onPressed: isFormValid ? _handleLogin : null,
                        ),

                        const SizedBox(height: 28),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                height: 1,
                                color: AlidColors.line,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                              child: Text(
                                "atau lanjutkan dengan google",
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 12,
                                  color: AlidColors.stone,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                height: 1,
                                color: AlidColors.line,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: OutlinedButton(
                            onPressed: _handleGoogleLogin,
                            style: OutlinedButton.styleFrom(
                              backgroundColor: Colors.white,
                              side: const BorderSide(
                                color: AlidColors.line,
                                width: 1.2,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Image.network(
                                  'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
                                  height: 20,
                                  errorBuilder: (_, _, _) => const Icon(
                                    Icons.g_mobiledata,
                                    size: 30,
                                    color: Colors.red,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  "Google",
                                  style: GoogleFonts.plusJakartaSans(
                                    color: AlidColors.wine,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 32),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Belum punya akun? ",
                              style: GoogleFonts.plusJakartaSans(
                                color: AlidColors.stone,
                                fontSize: 14,
                              ),
                            ),
                            GestureDetector(
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      RegisterScreen(role: widget.role),
                                ),
                              ),
                              child: Text(
                                "Daftar",
                                style: GoogleFonts.plusJakartaSans(
                                  color: AlidColors.wine,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                  decoration: TextDecoration.underline,
                                  decorationColor: AlidColors.gold,
                                  decorationThickness: 2,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
              ),

              // Tombol kembali
              Positioned(
                top: 8,
                left: 8,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    size: 18,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _brandHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 220,
      padding: const EdgeInsets.fromLTRB(28, 56, 28, 0),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AlidColors.wine, AlidColors.wineSoft],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AlidColors.gold,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'DANA AMAN TERVERIFIKASI',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.6,
                  color: AlidColors.gold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          RichText(
            text: TextSpan(
              style: GoogleFonts.spaceGrotesk(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                letterSpacing: -1,
                color: Colors.white,
                height: 1.0,
              ),
              children: const [
                TextSpan(text: 'Alid'),
                TextSpan(
                  text: 'Pay',
                  style: TextStyle(color: AlidColors.gold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Setiap transaksi, kami yang jaga.',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 14.5,
              fontWeight: FontWeight.w400,
              color: Colors.white.withValues(alpha: 0.7),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogin() async {
    final navigator = Navigator.of(context);
    setState(() => isLoading = true);

    try {
      final response = await controller.login(
        email: emailController.text.trim().toLowerCase(),
        password: passwordController.text,
        role: widget.role,
      );

      final userData = response['user'];
      final role = userData?['role']?.toString();

      if (!mounted) return;
      if (userData != null) {
        final userModel = UserModel.fromJson(userData);
        await Provider.of<AuthProvider>(
          context,
          listen: false,
        ).setUser(userModel);
      }

      if (role == 'pembeli') {
        navigator.pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => const MainNavScreen(role: 'pembelian'),
          ),
          (route) => false,
        );
        return;
      }

      if (role == 'penjual') {
        navigator.pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => const MainNavScreen(role: 'penjual'),
          ),
          (route) => false,
        );
        return;
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            "Role login tidak dikenali. Silakan coba lagi.",
            style: GoogleFonts.plusJakartaSans(),
          ),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    } catch (e) {
      if (!context.mounted) return;

      String errorMessage = "Terjadi kesalahan, coba lagi nanti ya, bro.";

      if (e is DioException) {
        if (e.response != null && e.response?.data != null) {
          errorMessage =
              e.response?.data['message']?.toString() ?? errorMessage;
        } else {
          final errType = e.type;
          if (errType == DioExceptionType.connectionTimeout ||
              errType == DioExceptionType.receiveTimeout) {
            errorMessage =
                "Koneksi ke server kelamaan (timeout). Coba lagi, bro.";
          } else if (errType == DioExceptionType.connectionError) {
            errorMessage =
                "Gagal terhubung ke server. Cek internet lo aktif apa kagak.";
          } else {
            errorMessage = "Koneksi ke server terputus, bro.";
          }
        }
      } else {
        String rawError = e.toString().toLowerCase();
        if (rawError.contains('socketexception') ||
            rawError.contains('network_error')) {
          errorMessage =
              "Kagak ada internet, bro. Periksa Wi-Fi atau paket data lo.";
        } else if (rawError.contains('null check operator')) {
          errorMessage =
              "Ada data kosong yang bikin crash. Coba lapor ke admin.";
        } else {
          errorMessage = e.toString().replaceAll("Exception: ", "");
        }
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage, style: GoogleFonts.plusJakartaSans()),
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() => isLoading = true);
    try {
      final response = await controller.loginWithGoogle(role: widget.role);
      if (!mounted) return;

      if (response != null) {
        final userData = response['user'];
        final String role = userData['role'] ?? widget.role;

        final userModel = UserModel.fromJson(userData);
        await Provider.of<AuthProvider>(
          context,
          listen: false,
        ).setUser(userModel);

        if (!mounted) return;

        if (role == 'pembeli') {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (_) => const MainNavScreen(role: 'pembelian'),
            ),
            (route) => false,
          );
        } else if (role == 'penjual') {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (_) => const MainNavScreen(role: 'penjual'),
            ),
            (route) => false,
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Login Google dibatalkan",
              style: GoogleFonts.plusJakartaSans(),
            ),
          ),
        );
      }
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString(), style: GoogleFonts.plusJakartaSans()),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }
}
