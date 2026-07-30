import 'package:flutter/foundation.dart';

/// Message from GET/POST /api/support-tickets/:id/messages|reply.
@immutable
class SupportTicketMessage {
  const SupportTicketMessage({
    required this.id,
    required this.author,
    required this.body,
    required this.createdAt,
    this.authorName = '',
    this.isOptimistic = false,
  });

  final String id;
  final String author; // CUSTOMER | ADMIN
  final String body;
  final DateTime createdAt;
  final String authorName;
  final bool isOptimistic;

  bool get isCustomer => author.toUpperCase() == 'CUSTOMER';
  bool get isAdmin => author.toUpperCase() == 'ADMIN';

  SupportTicketMessage copyWith({
    String? id,
    String? author,
    String? body,
    DateTime? createdAt,
    String? authorName,
    bool? isOptimistic,
  }) =>
      SupportTicketMessage(
        id: id ?? this.id,
        author: author ?? this.author,
        body: body ?? this.body,
        createdAt: createdAt ?? this.createdAt,
        authorName: authorName ?? this.authorName,
        isOptimistic: isOptimistic ?? this.isOptimistic,
      );

  factory SupportTicketMessage.fromApi(Map<String, dynamic> json) => SupportTicketMessage(
        id: json['id']?.toString() ?? '',
        author: json['author']?.toString() ?? 'CUSTOMER',
        body: json['body']?.toString() ?? '',
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
        authorName: json['authorName']?.toString() ?? '',
      );
}
