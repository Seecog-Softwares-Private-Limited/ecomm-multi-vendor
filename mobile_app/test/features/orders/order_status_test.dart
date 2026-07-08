import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/features/orders/presentation/orders_providers.dart';

void main() {
  group('orderStatusPresentation', () {
    test('is case-insensitive and maps known statuses', () {
      expect(orderStatusPresentation('delivered').label, 'Delivered');
      expect(orderStatusPresentation('SHIPPED').icon, Icons.local_shipping_outlined);
    });

    test('falls back to the raw code for unknown statuses', () {
      final p = orderStatusPresentation('WEIRD');
      expect(p.label, 'WEIRD');
      expect(p.icon, Icons.info_outline);
    });
  });

  group('orderIsCancellable', () {
    test('allows cancellation only before shipping', () {
      expect(orderIsCancellable('PLACED'), isTrue);
      expect(orderIsCancellable('processing'), isTrue);
      expect(orderIsCancellable('SHIPPED'), isFalse);
      expect(orderIsCancellable('DELIVERED'), isFalse);
      expect(orderIsCancellable('CANCELLED'), isFalse);
    });
  });

  test('progress milestones are ordered end-to-end', () {
    expect(kOrderProgress.first, 'PLACED');
    expect(kOrderProgress.last, 'DELIVERED');
    expect(kOrderProgress.length, 5);
  });
}
