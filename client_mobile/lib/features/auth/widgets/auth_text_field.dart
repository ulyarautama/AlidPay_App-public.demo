import 'package:flutter/material.dart';

class AuthTextField extends StatelessWidget {
  final String hint;
  final IconData icon;
  final TextEditingController controller;

  final bool obscureText;
  final Widget? suffixIcon;
  final TextInputType keyboardType;

  const AuthTextField({
    super.key,
    required this.hint,
    required this.icon,
    required this.controller,
    this.obscureText = false,
    this.suffixIcon,
    this.keyboardType = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,

      decoration: InputDecoration(
        hintText: hint,

        prefixIcon: Icon(icon, size: 20),

        suffixIcon: suffixIcon,

      ),
    );
  }
}
