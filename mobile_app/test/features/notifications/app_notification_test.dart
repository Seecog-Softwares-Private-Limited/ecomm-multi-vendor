import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/features/notifications/domain/app_notification.dart';

void main() {
  final sample = AppNotification(
    id: 'n1',
    title: 'Order shipped',
    body: 'Your order is on the way.',
    type: NotificationType.order,
    createdAt: DateTime.parse('2026-01-02T10:30:00.000'),
  );

  test('json round-trips all fields', () {
    final restored = AppNotification.fromJson(sample.toJson());
    expect(restored.id, sample.id);
    expect(restored.title, sample.title);
    expect(restored.body, sample.body);
    expect(restored.type, NotificationType.order);
    expect(restored.createdAt, sample.createdAt);
    expect(restored.read, isFalse);
  });

  test('copyWith toggles read without touching other fields', () {
    final read = sample.copyWith(read: true);
    expect(read.read, isTrue);
    expect(read.id, sample.id);
    expect(read.title, sample.title);
  });

  test('unknown type falls back to general', () {
    final n = AppNotification.fromJson({
      'id': 'x',
      'title': 't',
      'body': 'b',
      'type': 'nonsense',
      'createdAt': '2026-01-01T00:00:00.000',
      'read': true,
    });
    expect(n.type, NotificationType.general);
    expect(n.read, isTrue);
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
