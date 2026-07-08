import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/core/utils/formatters.dart';

void main() {
  group('Formatters.rupees', () {
    test('formats with Indian digit grouping and rupee symbol', () {
      expect(Formatters.rupees(0), '\u20B90');
      expect(Formatters.rupees(999), '\u20B9999');
      expect(Formatters.rupees(1000), '\u20B91,000');
      expect(Formatters.rupees(100000), '\u20B91,00,000');
      expect(Formatters.rupees(1234567), '\u20B912,34,567');
    });

    test('handles negatives', () {
      expect(Formatters.rupees(-2500), '-\u20B92,500');
    });
  });
}
