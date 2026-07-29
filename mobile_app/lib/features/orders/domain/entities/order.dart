import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../core/utils/image_url.dart';

part 'order.freezed.dart';
part 'order.g.dart';

@freezed
abstract class OrderSummary with _$OrderSummary {
  const factory OrderSummary({
    required String id,
    required String status,
    required double totalAmount,
    required DateTime createdAt,
    @Default(0) int itemCount,
  }) = _OrderSummary;

  factory OrderSummary.fromJson(Map<String, dynamic> json) => _$OrderSummaryFromJson(json);
}

@freezed
abstract class OrderItemLine with _$OrderItemLine {
  const OrderItemLine._();

  const factory OrderItemLine({
    required String id,
    required String productId,
    required String productName,
    String? imageUrl,
    String? variantKey,
    @Default(1) int quantity,
    @Default(0) double unitPrice,
    @Default(0) double totalPrice,
  }) = _OrderItemLine;

  factory OrderItemLine.fromJson(Map<String, dynamic> json) => _$OrderItemLineFromJson(json);

  String? get image => resolveImageUrl(imageUrl);
}

@freezed
abstract class OrderTimelineEvent with _$OrderTimelineEvent {
  const factory OrderTimelineEvent({
    required String status,
    String? note,
    required DateTime occurredAt,
  }) = _OrderTimelineEvent;

  factory OrderTimelineEvent.fromJson(Map<String, dynamic> json) =>
      _$OrderTimelineEventFromJson(json);
}

@freezed
abstract class OrderAddress with _$OrderAddress {
  const OrderAddress._();

  const factory OrderAddress({
    required String fullName,
    required String line1,
    String? line2,
    required String city,
    required String state,
    required String pincode,
    required String phone,
  }) = _OrderAddress;

  factory OrderAddress.fromJson(Map<String, dynamic> json) => _$OrderAddressFromJson(json);

  String get formatted =>
      [line1, line2, '$city, $state $pincode'].where((e) => e != null && e.isNotEmpty).join(', ');
}

@freezed
abstract class OrderDetail with _$OrderDetail {
  const factory OrderDetail({
    required String id,
    required String status,
    @Default(0) double totalAmount,
    @Default(0) double discountAmount,
    @Default(0) double taxAmount,
    @Default(0) double shippingAmount,
    required DateTime createdAt,
    OrderAddress? address,
    @Default(<OrderItemLine>[]) List<OrderItemLine> items,
    @Default(<OrderTimelineEvent>[]) List<OrderTimelineEvent> timeline,
  }) = _OrderDetail;

  factory OrderDetail.fromJson(Map<String, dynamic> json) => _$OrderDetailFromJson(json);
}

/// Result of placing an order.
class PlaceOrderResult {
  const PlaceOrderResult({
    required this.orderId,
    required this.totalAmount,
    required this.requiresRazorpay,
    required this.message,
  });

  final String orderId;
  final double totalAmount;
  final bool requiresRazorpay;
  final String message;
}
