import 'package:flutter/foundation.dart';

/// FAQ entry from GET /api/faqs.
@immutable
class FaqItem {
  const FaqItem({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
    this.displayOrder = 0,
  });

  final String id;
  final String category;
  final String question;
  final String answer;
  final int displayOrder;

  factory FaqItem.fromApi(Map<String, dynamic> json) => FaqItem(
        id: json['id']?.toString() ?? '',
        category: (json['category']?.toString() ?? 'general').toLowerCase(),
        question: json['question']?.toString() ?? '',
        answer: json['answer']?.toString() ?? '',
        displayOrder: (json['displayOrder'] as num?)?.toInt() ?? 0,
      );
}

/// Seeded Help Center category ids (client-side filter; API returns all FAQs).
abstract final class FaqCategories {
  const FaqCategories._();

  static const all = 'all';
  static const general = 'general';
  static const orders = 'orders';
  static const returns = 'returns';
  static const payments = 'payments';
  static const account = 'account';

  static const ordered = <String>[
    all,
    general,
    orders,
    returns,
    payments,
    account,
  ];

  static String label(String id) => switch (id) {
        all => 'All',
        general => 'General',
        orders => 'Orders',
        returns => 'Returns & Refunds',
        payments => 'Payments',
        account => 'Account & Security',
        _ => id,
      };
}
