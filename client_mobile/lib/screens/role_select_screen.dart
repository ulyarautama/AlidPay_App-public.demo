import 'package:client_mobile/screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

/// ===== BRAND PALETTE — ALIDPAY =====
/// Warna dominan brand: Burgundy Wine + Gold accent.
/// Ini yang bikin AlidPay dikenali walau tanpa logo/icon —
/// belum diklaim e-wallet lain di Indonesia (OVO=ungu, GoPay=biru,
/// Tokopedia=hijau, ShopeePay=oren).
class AlidColors {
  static const wine = Color(
    0xFF6B1E2C,
  ); // burgundy pekat — warna identitas utama
  static const wineSoft = Color(
    0xFF8A2E3F,
  ); // burgundy sedikit lebih terang, untuk gradasi header
  static const gold = Color(
    0xFFC89A56,
  ); // signature accent — dipakai sedikit, konsisten
  static const cream = Color(
    0xFFF5EFE6,
  ); // background hangat, bukan putih polos
  static const stone = Color(
    0xFF8C7A73,
  ); // teks sekunder warm-gray, senada wine
  static const line = Color(0x1A6B1E2C); // garis tipis pemisah (wine 10%)

  // Warna fungsional per role — sesuai instruksi, tidak diubah
  static const beli = Color(0xFF8B5CF6); // ungu kebiruan
  static const jual = Color(0xFF10B981); // hijau
}

class RoleSelectScreen extends StatefulWidget {
  const RoleSelectScreen({super.key});

  @override
  State<RoleSelectScreen> createState() => _RoleSelectScreenState();
}

class _RoleSelectScreenState extends State<RoleSelectScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.justLoggedOut) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(
                  Icons.check_circle_rounded,
                  color: Colors.white,
                  size: 20,
                ),
                const SizedBox(width: 10),
                Text('Berhasil logout', style: GoogleFonts.plusJakartaSans()),
              ],
            ),
            backgroundColor: AlidColors.wine,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
        auth.justLoggedOut = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AlidColors.wine, // dasar layar ikut wine, biar nggak ada
      // garis potong warna di area status bar / notch
      body: SafeArea(
        bottom: false,
        child: SizedBox.expand(
          child: Stack(
            children: [
              _brandHeader(),

              // Card konten menimpa header dengan overlap negatif —
              // transisi berlapis, bukan potongan kaku warna vs putih.
              Positioned.fill(
                top: 190,
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
                          'PILIH PERANMU',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2.2,
                            color: AlidColors.wine,
                          ),
                        ),
                        const SizedBox(height: 4),

                        _roleRow(
                          title: 'Beli',
                          subtitle:
                              'Dana ditahan sampai pesanan diterima dengan baik',
                          icon: Icons.shopping_bag_rounded,
                          color: AlidColors.gold,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  const LoginScreen(role: "pembeli"),
                            ),
                          ),
                        ),
                        _divider(),
                        _roleRow(
                          title: 'Jual',
                          subtitle:
                              'Dana otomatis cair setelah transaksi selesai',
                          icon: Icons.storefront_rounded,
                          color: AlidColors.gold,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  const LoginScreen(role: "penjual"),
                            ),
                          ),
                        ),
                        _divider(),

                        const SizedBox(height: 40),
                        _footer(),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ===== HEADER: backdrop wine, ditumpuk card cream di atasnya =====
  Widget _brandHeader() {
    return Container(
      width: double.infinity,
      height: 260,
      padding: const EdgeInsets.fromLTRB(28, 28, 28, 0),
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
          const SizedBox(height: 18),
          RichText(
            text: TextSpan(
              style: GoogleFonts.spaceGrotesk(
                fontSize: 40,
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

  Widget _roleRow({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 22),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 19,
                        fontWeight: FontWeight.w600,
                        color: AlidColors.wine,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        color: AlidColors.stone,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_rounded,
                color: AlidColors.wine.withValues(alpha: 0.35),
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _divider() => Container(height: 1, color: AlidColors.line);

  Widget _footer() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Butuh bantuan terkait transaksi?',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12.5,
            color: AlidColors.stone,
          ),
        ),
        const SizedBox(height: 4),
        InkWell(
          onTap: () {
            // todo: arahkan ke CS / WA / Hubungi Kami
          },
          child: Text(
            'Hubungi Pusat Bantuan',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AlidColors.wine,
              decoration: TextDecoration.underline,
              decorationColor: AlidColors.gold,
              decorationThickness: 2,
            ),
          ),
        ),
      ],
    );
  }
}
