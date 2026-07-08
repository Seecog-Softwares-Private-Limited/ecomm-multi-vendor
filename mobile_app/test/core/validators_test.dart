import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/core/utils/validators.dart';

void main() {
  group('email', () {
    test('accepts a well-formed address', () {
      expect(Validators.email('user@example.com'), isNull);
    });
    test('rejects empty and malformed addresses', () {
      expect(Validators.email(''), isNotNull);
      expect(Validators.email('nope'), isNotNull);
      expect(Validators.email('a@b'), isNotNull);
    });
  });

  group('password', () {
    test('enforces minimum length', () {
      expect(Validators.password('12345'), isNotNull);
      expect(Validators.password('123456'), isNull);
    });
  });

  group('confirmPassword', () {
    test('must match the original', () {
      expect(Validators.confirmPassword('abcdef', 'abcdef'), isNull);
      expect(Validators.confirmPassword('abcdef', 'xyz'), isNotNull);
    });
  });

  group('phone', () {
    test('accepts a valid Indian mobile with or without prefix', () {
      expect(Validators.phone('9876543210'), isNull);
      expect(Validators.phone('+91 98765 43210'), isNull);
    });
    test('rejects invalid numbers', () {
      expect(Validators.phone('1234567890'), isNotNull);
      expect(Validators.phone('98765'), isNotNull);
    });
    test('respects the optional flag when empty', () {
      expect(Validators.phone('', optional: true), isNull);
      expect(Validators.phone(''), isNotNull);
    });
  });

  group('pincode', () {
    test('requires exactly six digits', () {
      expect(Validators.pincode('560001'), isNull);
      expect(Validators.pincode('5600'), isNotNull);
      expect(Validators.pincode('abcdef'), isNotNull);
    });
  });

  group('otp', () {
    test('validates the configured length', () {
      expect(Validators.otp('123456'), isNull);
      expect(Validators.otp('123'), isNotNull);
      expect(Validators.otp('1234', length: 4), isNull);
    });
  });

  group('required / isSearchable', () {
    test('required trims whitespace', () {
      expect(Validators.required('  '), isNotNull);
      expect(Validators.required('ok'), isNull);
    });
    test('isSearchable reflects non-empty input', () {
      expect(Validators.isSearchable('  '), isFalse);
      expect(Validators.isSearchable('phone'), isTrue);
    });
  });
}
