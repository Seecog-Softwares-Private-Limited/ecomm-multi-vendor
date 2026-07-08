// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'support_ticket.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SupportTicket _$SupportTicketFromJson(Map<String, dynamic> json) =>
    _SupportTicket(
      id: json['id'] as String,
      shortId: json['shortId'] as String? ?? '',
      subject: json['subject'] as String,
      status: json['status'] as String? ?? 'OPEN',
      orderId: json['orderId'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      adminReply: json['adminReply'] as String?,
    );

Map<String, dynamic> _$SupportTicketToJson(_SupportTicket instance) =>
    <String, dynamic>{
      'id': instance.id,
      'shortId': instance.shortId,
      'subject': instance.subject,
      'status': instance.status,
      'orderId': instance.orderId,
      'createdAt': instance.createdAt.toIso8601String(),
      'adminReply': instance.adminReply,
    };
