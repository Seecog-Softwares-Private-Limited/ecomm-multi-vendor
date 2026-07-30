import 'package:freezed_annotation/freezed_annotation.dart';

part 'support_ticket.freezed.dart';
part 'support_ticket.g.dart';

@freezed
abstract class SupportTicket with _$SupportTicket {
  const SupportTicket._();

  const factory SupportTicket({
    required String id,
    @Default('') String shortId,
    required String subject,
    @Default('OPEN') String status,
    String? orderId,
    required DateTime createdAt,
    DateTime? lastUpdateAt,
    DateTime? updatedAt,
    String? adminReply,
    DateTime? adminRepliedAt,
  }) = _SupportTicket;

  factory SupportTicket.fromJson(Map<String, dynamic> json) => _$SupportTicketFromJson(json);

  /// True when support has left a reply (backend has no unread/read flags).
  bool get hasSupportReply =>
      (adminReply != null && adminReply!.trim().isNotEmpty) || adminRepliedAt != null;

  DateTime get sortDate => lastUpdateAt ?? updatedAt ?? createdAt;
}
