import 'package:freezed_annotation/freezed_annotation.dart';

part 'address.freezed.dart';
part 'address.g.dart';

@freezed
abstract class Address with _$Address {
  const Address._();

  const factory Address({
    required String id,
    @Default('HOME') String type,
    @Default('Home') String name,
    required String fullName,
    required String line1,
    String? line2,
    required String city,
    required String state,
    required String pincode,
    required String phone,
    @Default(false) bool isDefault,
    @Default('') String address,
  }) = _Address;

  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);

  String get formatted =>
      address.isNotEmpty ? address : [line1, line2, '$city, $state $pincode'].where((e) => e != null && e.isNotEmpty).join(', ');
}
