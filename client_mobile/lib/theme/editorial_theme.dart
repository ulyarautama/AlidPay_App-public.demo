import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class EditorialTheme {
  static const bg = Color(0xFFF5EFE6);
  static const surface = Color(0xFFEFECE4);
  static const inkPrimary = Color(0xFF181715);
  static const inkSecondary = Color(0xFF75726B);
  static const border = Color(0xFFE0DDD5);
  static const accentOrange = Color(0xFFC85A28);
  static const accentGold = Color(0xFFD49A2B);
  static const successGreen = Color(0xFF10B981);
  static const gold = Color(0xFFC89A56); 

  static TextStyle display(
    double size, {
    FontWeight weight = FontWeight.w700,
    Color color = inkPrimary,
  }) {
    return GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: 1.15,
      letterSpacing: -0.5,
    );
  }

  static TextStyle body(
    double size, {
    FontWeight weight = FontWeight.w400,
    Color color = inkSecondary,
  }) {
    return GoogleFonts.plusJakartaSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: 1.4,
    );
  }
}
