import 'package:flutter/material.dart';

abstract final class AppBrand {
  static const loginGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF1E5128),
      Color(0xFF166534),
      Color(0xFFC2410C),
      Color(0xFFFF6A00),
      Color(0xFFFF5400),
    ],
    stops: [0.0, 0.22, 0.55, 0.85, 1.0],
  );

  static const bottomNavShadow = BoxShadow(
    color: Color(0x1F0F172A),
    blurRadius: 30,
    offset: Offset(0, -12),
  );
}
