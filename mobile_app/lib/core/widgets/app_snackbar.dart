import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Snackbar helpers for consistent success/error feedback.
extension AppSnackBar on BuildContext {
  void showSnack(String message, {bool isError = false}) {
    final messenger = ScaffoldMessenger.of(this);
    messenger
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                isError ? Icons.error_outline : Icons.check_circle_outline,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(child: Text(message)),
            ],
          ),
          backgroundColor: isError ? AppColors.error : AppColors.success,
        ),
      );
  }
}
