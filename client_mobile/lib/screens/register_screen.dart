import 'dart:async';
import 'package:client_mobile/screens/verification_screen.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../features/auth/widgets/auth_button.dart';
import '../features/auth/widgets/auth_text_field.dart';
import '../features/auth/widgets/password_requirement.dart';

import '../features/auth/register/register_controller.dart';
import '../features/auth/data/auth_repository.dart';
import '../features/auth/data/auth_api.dart';
import 'role_select_screen.dart'; // pakai AlidColors

class RegisterScreen extends StatefulWidget {
  final String role;
  const RegisterScreen({super.key, required this.role});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  String? errorMessage;
  bool obscure = true;
  bool isLoading = false;

  Timer? _emailDebounce;
  bool _isCheckingEmail = false;
  bool _emailExists = false;
  String? _lastCheckedEmail;

  Timer? _nameDebounce;
  bool _isCheckingName = false;
  bool _nameExists = false;
  String? _lastCheckedName;

  late final RegisterController controller;

  bool isValidEmail(String email) {
    return RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  int score = 0;

  bool get hasMinLength => nameController.text.trim().length >= 3;
  bool get hasMaxLength => nameController.text.trim().length <= 30;

  bool get validCharacters =>
      RegExp(r'^[a-zA-Z0-9\s.,]+$').hasMatch(nameController.text.trim());

  bool get isFormValid {
    return hasMinLength &&
        hasMaxLength &&
        validCharacters &&
        isValidEmail(emailController.text.trim()) &&
        !_emailExists &&
        !_isCheckingEmail &&
        !_nameExists &&
        !_isCheckingName &&
        score == 4;
  }

  String? get usernameError {
    final username = nameController.text.trim();

    if (username.isEmpty) return null;
    if (username.length < 3) {
      return "Nama pengguna minimal 3 karakter.";
    }
    if (username.length > 30) {
      return "Nama pengguna maksimal 30 karakter.";
    }
    if (!validCharacters) {
      return "Nama hanya boleh berisi huruf, spasi, angka, titik (.), dan koma (,).";
    }
    if (_nameExists && username == _lastCheckedName) {
      return "Nama pengguna ini sudah dipakai. Coba nama lain, ya.";
    }
    return null;
  }

  String? get emailError {
    final email = emailController.text.trim();

    if (email.isEmpty) return null;

    if (!isValidEmail(email)) {
      return "Format alamat email tidak valid (contoh: example@gmail.com).";
    }

    if (_emailExists && email == _lastCheckedEmail) {
      return "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.";
    }
    return null;
  }

  void calculatePasswordScore() {
    score = 0;
    final password = passwordController.text;

    if (password.length >= 8) score++;
    if (RegExp(r'[a-z]').hasMatch(password)) score++;
    if (RegExp(r'[A-Z]').hasMatch(password)) score++;
    if (RegExp(r'[0-9]').hasMatch(password)) score++;
  }

  void _onEmailChanged() {
    setState(() {});

    final email = emailController.text.trim();
    _emailDebounce?.cancel();

    if (!isValidEmail(email)) {
      setState(() {
        _emailExists = false;
        _isCheckingEmail = false;
        _lastCheckedEmail = null;
      });
      return;
    }

    _emailDebounce = Timer(const Duration(milliseconds: 600), () async {
      setState(() => _isCheckingEmail = true);

      try {
        final exists = await controller.checkEmailExists(email: email);
        if (!mounted) return;

        setState(() {
          _emailExists = exists;
          _lastCheckedEmail = email;
          _isCheckingEmail = false;
        });

        if (exists && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Email ini sudah terdaftar. Coba pakai email lain, ya.',
                style: GoogleFonts.plusJakartaSans(),
              ),
              backgroundColor: const Color(0xFFEF4444),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      } catch (e) {
        if (!mounted) return;
        setState(() => _isCheckingEmail = false);
      }
    });
  }

  void _onNameChanged() {
    setState(() {});

    final username = nameController.text.trim();
    _nameDebounce?.cancel();

    if (username.length < 3 || username.length > 30 || !validCharacters) {
      setState(() {
        _nameExists = false;
        _lastCheckedName = null;
        _isCheckingName = false;
      });
      return;
    }

    _nameDebounce = Timer(const Duration(milliseconds: 600), () async {
      setState(() => _isCheckingName = true);

      try {
        final exists = await controller.checkNameExists(name: username);
        if (!mounted) return;

        setState(() {
          _nameExists = exists;
          _lastCheckedName = username;
          _isCheckingName = false;
        });

        if (exists && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Nama pengguna ini sudah dipakai. Coba nama lain, ya.',
                style: GoogleFonts.plusJakartaSans(),
              ),
              backgroundColor: const Color(0xFFEF4444),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      } catch (e) {
        if (!mounted) return;
        setState(() => _isCheckingName = false);
      }
    });
  }

  @override
  void initState() {
    super.initState();
    controller = RegisterController(AuthRepository(AuthApi()));

    nameController.addListener(_onNameChanged);
    emailController.addListener(_onEmailChanged);
    passwordController.addListener(() {
      calculatePasswordScore();
      setState(() {});
    });
  }

  @override
  void dispose() {
    _emailDebounce?.cancel();
    nameController.dispose();
    _nameDebounce?.cancel();
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
              _brandHeader(),
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
                          'BUAT AKUN BARU',
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
                              ? 'Daftar sebagai penjual'
                              : 'Daftar sebagai pembeli',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: AlidColors.wine,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 32),
                        // --- Nama Pengguna ---
                        AuthTextField(
                          hint: "Nama Pengguna",
                          icon: Icons.person_outline_rounded,
                          controller: nameController,
                        ),

                        if (nameController.text.trim().isNotEmpty) ...[
                          if (_isCheckingName)
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
                                    "Mengecek nama pengguna...",
                                    style: GoogleFonts.plusJakartaSans(
                                      color: AlidColors.stone,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else if (usernameError != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 10, left: 4),
                              child: Text(
                                usernameError!,
                                style: GoogleFonts.plusJakartaSans(
                                  color: const Color(0xFFEF4444),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            )
                          else if (hasMinLength &&
                              hasMaxLength &&
                              validCharacters &&
                              nameController.text.trim() == _lastCheckedName &&
                              !_nameExists)
                            Padding(
                              padding: const EdgeInsets.only(top: 10, left: 4),
                              child: Text(
                                "✓ Nama pengguna dapat digunakan",
                                style: GoogleFonts.plusJakartaSans(
                                  color: AlidColors.jual,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                        ],

                        const SizedBox(height: 20),
                        Container(height: 1, color: AlidColors.line),
                        const SizedBox(height: 20),

                        // --- Email ---
                        AuthTextField(
                          hint: "Alamat Email Aktif",
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
                                    "Mengecek ketersediaan email...",
                                    style: GoogleFonts.plusJakartaSans(
                                      color: AlidColors.stone,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else if (emailError != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 10, left: 4),
                              child: Text(
                                emailError!,
                                style: GoogleFonts.plusJakartaSans(
                                  color: const Color(0xFFEF4444),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            )
                          else if (isValidEmail(emailController.text.trim()) &&
                              emailController.text.trim() ==
                                  _lastCheckedEmail &&
                              !_emailExists)
                            Padding(
                              padding: const EdgeInsets.only(top: 10, left: 4),
                              child: Text(
                                "✓ Email dapat digunakan",
                                style: GoogleFonts.plusJakartaSans(
                                  color: AlidColors.jual,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                        ],

                        const SizedBox(height: 20),
                        Container(height: 1, color: AlidColors.line),
                        const SizedBox(height: 20),

                        // --- Password ---
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

                        const SizedBox(height: 16),

                        // Password Strength Bars — pakai wine, bukan ungu
                        Row(
                          children: List.generate(4, (index) {
                            return Expanded(
                              child: Container(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 2,
                                ),
                                height: 5,
                                decoration: BoxDecoration(
                                  color: index < score
                                      ? AlidColors.wine
                                      : AlidColors.line,
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                            );
                          }),
                        ),

                        const SizedBox(height: 18),

                        PasswordRequirement(
                          text: "Minimal 8 karakter",
                          fulfilled: passwordController.text.length >= 8,
                        ),
                        PasswordRequirement(
                          text: "Mengandung huruf kecil (a-z)",
                          fulfilled: RegExp(
                            r'[a-z]',
                          ).hasMatch(passwordController.text),
                        ),
                        PasswordRequirement(
                          text: "Mengandung huruf besar (A-Z)",
                          fulfilled: RegExp(
                            r'[A-Z]',
                          ).hasMatch(passwordController.text),
                        ),
                        PasswordRequirement(
                          text: "Mengandung angka (0-9)",
                          fulfilled: RegExp(
                            r'[0-9]',
                          ).hasMatch(passwordController.text),
                        ),

                        const SizedBox(height: 36),

                        AuthButton(
                          text: "Daftar Akun",
                          isLoading: isLoading,
                          onPressed: isFormValid ? _handleRegister : null,
                        ),

                        const SizedBox(height: 28),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Sudah menjadi anggota? ",
                              style: GoogleFonts.plusJakartaSans(
                                color: AlidColors.stone,
                                fontSize: 14,
                              ),
                            ),
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: Text(
                                "Masuk",
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

  Widget _brandHeader() {
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
                'BERGABUNG DENGAN ALIDPAY',
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

  Future<void> _handleRegister() async {
    setState(() => isLoading = true);
    try {
      final stillExists = await controller.checkEmailExists(
        email: emailController.text.trim().toLowerCase(),
      );

      if (stillExists) {
        if (!mounted) return;
        setState(() {
          _emailExists = true;
          _lastCheckedEmail = emailController.text.trim();
          isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Email ini sudah terdaftar. Coba pakai email lain, ya.',
              style: GoogleFonts.plusJakartaSans(),
            ),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
        return;
      }

      await controller.register(
        name: nameController.text.trim(),
        email: emailController.text.trim().toLowerCase(),
        password: passwordController.text,
        role: widget.role,
      );

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => VerificationScreen(
            email: emailController.text.trim().toLowerCase(),
            name: nameController.text.trim(),
            password: passwordController.text,
            role: widget.role,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
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
