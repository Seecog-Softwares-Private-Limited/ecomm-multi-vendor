/// Reusable form validators returning an error string (or null when valid).
abstract final class Validators {
  const Validators._();

  static final RegExp _email = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  static final RegExp _digits = RegExp(r'\D');

  static String? required(String? value, {String field = 'This field'}) {
    if (value == null || value.trim().isEmpty) return '$field is required';
    return null;
  }

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Email is required';
    if (!_email.hasMatch(v)) return 'Enter a valid email address';
    return null;
  }

  static String? password(String? value, {int min = 8}) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < min) return 'Use at least $min characters';
    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Include at least one uppercase letter';
    }
    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return 'Include at least one lowercase letter';
    }
    if (!RegExp(r'\d').hasMatch(value)) {
      return 'Include at least one number';
    }
    return null;
  }

  static String? confirmPassword(String? value, String original) {
    if (value == null || value.isEmpty) return 'Please confirm your password';
    if (value != original) return 'Passwords do not match';
    return null;
  }

  /// Indian 10-digit mobile number (optionally prefixed with +91/0).
  static String? phone(String? value, {bool optional = false}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return optional ? null : 'Mobile number is required';
    final digits = v.replaceAll(_digits, '');
    final national = digits.length > 10 ? digits.substring(digits.length - 10) : digits;
    if (national.length != 10 || !RegExp(r'^[6-9]\d{9}$').hasMatch(national)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  }

  static String? pincode(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Pincode is required';
    if (!RegExp(r'^\d{6}$').hasMatch(v)) return 'Enter a valid 6-digit pincode';
    return null;
  }

  static String? otp(String? value, {int length = 6}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Enter the OTP';
    if (!RegExp('^\\d{$length}\$').hasMatch(v)) return 'Enter the $length-digit code';
    return null;
  }

  /// Non-blocking check used to decide whether a search should execute.
  static bool isSearchable(String? value) => value?.trim().isNotEmpty ?? false;
}
