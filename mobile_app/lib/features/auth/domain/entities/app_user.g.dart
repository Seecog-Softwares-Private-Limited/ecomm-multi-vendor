// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AppUser _$AppUserFromJson(Map<String, dynamic> json) => _AppUser(
  id: json['id'] as String,
  email: json['email'] as String,
  firstName: json['firstName'] as String?,
  lastName: json['lastName'] as String?,
  phone: json['phone'] as String?,
  role: json['role'] as String? ?? 'CUSTOMER',
  avatarUrl: json['avatarUrl'] as String?,
);

Map<String, dynamic> _$AppUserToJson(_AppUser instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'phone': instance.phone,
  'role': instance.role,
  'avatarUrl': instance.avatarUrl,
};

_ProfileStats _$ProfileStatsFromJson(Map<String, dynamic> json) =>
    _ProfileStats(
      orderCount: (json['orderCount'] as num?)?.toInt() ?? 0,
      wishlistCount: (json['wishlistCount'] as num?)?.toInt() ?? 0,
      addressCount: (json['addressCount'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$ProfileStatsToJson(_ProfileStats instance) =>
    <String, dynamic>{
      'orderCount': instance.orderCount,
      'wishlistCount': instance.wishlistCount,
      'addressCount': instance.addressCount,
    };
