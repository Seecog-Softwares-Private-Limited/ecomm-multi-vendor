import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/features/notifications/domain/app_notification.dart';

void main() {
  final sample = AppNotification(
    id: 'n1',
    title: 'Order shipped',
    body: 'Your order is on the way.',
    type: NotificationType.order,
    createdAt: DateTime.parse('2026-01-02T10:30:00.000'),
    orderId: 'ord1234567890',
    productImageUrl: '/uploads/product.jpg',
  );

  test('fromApi parses API fields', () {
    final restored = AppNotification.fromApi({
      'id': sample.id,
      'title': sample.title,
      'message': sample.body,
      'type': 'ORDER',
      'createdAt': sample.createdAt.toIso8601String(),
      'read': false,
      'orderId': sample.orderId,
      'productImageUrl': sample.productImageUrl,
    });
    expect(restored.id, sample.id);
    expect(restored.title, sample.title);
    expect(restored.body, sample.body);
    expect(restored.type, NotificationType.order);
    expect(restored.orderId, sample.orderId);
    expect(restored.read, isFalse);
  });

  test('RETURN type maps to returnType', () {
    final n = AppNotification.fromApi({
      'id': 'r1',
      'title': 'Return update',
      'message': 'Your return was approved.',
      'type': 'RETURN',
      'createdAt': '2026-01-01T00:00:00.000',
      'read': true,
    });
    expect(n.type, NotificationType.returnType);
    expect(n.categoryKey, 'returns');
  });

  test('copyWith toggles read without touching other fields', () {
    final read = sample.copyWith(read: true);
    expect(read.read, isTrue);
    expect(read.id, sample.id);
    expect(read.title, sample.title);
  });

  test('icon and color differ across types', () {
    final general = AppNotification(
      id: 'g',
      title: '',
      body: '',
      type: NotificationType.general,
      createdAt: sample.createdAt,
    );
    expect(sample.icon, isNot(equals(general.icon)));
    expect(sample.color, isNot(equals(general.color)));
  });
}
