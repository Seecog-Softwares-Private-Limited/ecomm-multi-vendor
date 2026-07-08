// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'address.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Address _$AddressFromJson(Map<String, dynamic> json) => _Address(
  id: json['id'] as String,
  type: json['type'] as String? ?? 'HOME',
  name: json['name'] as String? ?? 'Home',
  fullName: json['fullName'] as String,
  line1: json['line1'] as String,
  line2: json['line2'] as String?,
  city: json['city'] as String,
  state: json['state'] as String,
  pincode: json['pincode'] as String,
  phone: json['phone'] as String,
  isDefault: json['isDefault'] as bool? ?? false,
  address: json['address'] as String? ?? '',
);

Map<String, dynamic> _$AddressToJson(_Address instance) => <String, dynamic>{
  'id': instance.id,
  'type': instance.type,
  'name': instance.name,
  'fullName': instance.fullName,
  'line1': instance.line1,
  'line2': instance.line2,
  'city': instance.city,
  'state': instance.state,
  'pincode': instance.pincode,
  'phone': instance.phone,
  'isDefault': instance.isDefault,
  'address': instance.address,
};
