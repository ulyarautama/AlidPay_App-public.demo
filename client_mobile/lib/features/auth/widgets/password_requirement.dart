import 'package:flutter/material.dart';

class PasswordRequirement extends StatelessWidget {
  final String text;
  final bool fulfilled;

  const PasswordRequirement({
    super.key,
    required this.text,
    required this.fulfilled,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(
            fulfilled
                ? Icons.check_circle
                : Icons.radio_button_unchecked,
            size: 18,
            color: fulfilled
                ? Colors.green
                : Colors.grey,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: fulfilled
                  ? Colors.green.shade700
                  : Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }
}