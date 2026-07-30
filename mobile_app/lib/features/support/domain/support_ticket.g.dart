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
      lastUpdateAt: json['lastUpdateAt'] == null
          ? null
          : DateTime.parse(json['lastUpdateAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      adminReply: json['adminReply'] as String?,
      adminRepliedAt: json['adminRepliedAt'] == null
          ? null
          : DateTime.parse(json['adminRepliedAt'] as String),
    );

Map<String, dynamic> _$SupportTicketToJson(_SupportTicket instance) =>
    <String, dynamic>{
      'id': instance.id,
      'shortId': instance.shortId,
      'subject': instance.subject,
      'status': instance.status,
      'orderId': instance.orderId,
      'createdAt': instance.createdAt.toIso8601String(),
      'lastUpdateAt': instance.lastUpdateAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'adminReply': instance.adminReply,
      'adminRepliedAt': instance.adminRepliedAt?.toIso8601String(),
    };
