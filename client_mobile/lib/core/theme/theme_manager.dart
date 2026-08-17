import 'package:flutter/material.dart';

class ThemeManager {
  // ValueNotifier untuk menyimpan status secara global
  static final ValueNotifier<ThemeMode> themeMode = ValueNotifier(ThemeMode.dark);

  static void toggleTheme(bool isDark) {
    themeMode.value = isDark ? ThemeMode.dark : ThemeMode.light;
  }
}