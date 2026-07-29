// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_OrderPreviewItem _$OrderPreviewItemFromJson(Map<String, dynamic> json) =>
    _OrderPreviewItem(
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      productSlug: json['productSlug'] as String?,
      imageUrl: json['imageUrl'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      variantKey: json['variantKey'] as String?,
    );

Map<String, dynamic> _$OrderPreviewItemToJson(_OrderPreviewItem instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'productName': instance.productName,
      'productSlug': instance.productSlug,
      'imageUrl': instance.imageUrl,
      'quantity': instance.quantity,
      'variantKey': instance.variantKey,
    };

_OrderSummary _$OrderSummaryFromJson(Map<String, dynamic> json) =>
    _OrderSummary(
      id: json['id'] as String,
      status: json['status'] as String,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      itemCount: (json['itemCount'] as num?)?.toInt() ?? 0,
      previewItems:
          (json['previewItems'] as List<dynamic>?)
              ?.map((e) => OrderPreviewItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <OrderPreviewItem>[],
    );

Map<String, dynamic> _$OrderSummaryToJson(_OrderSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': instance.status,
      'totalAmount': instance.totalAmount,
      'createdAt': instance.createdAt.toIso8601String(),
      'itemCount': instance.itemCount,
      'previewItems': instance.previewItems,
    };

_OrderItemLine _$OrderItemLineFromJson(Map<String, dynamic> json) =>
    _OrderItemLine(
      id: json['id'] as String,
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      imageUrl: json['imageUrl'] as String?,
      variantKey: json['variantKey'] as String?,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0,
    );

Map<String, dynamic> _$OrderItemLineToJson(_OrderItemLine instance) =>
    <String, dynamic>{
      'id': instance.id,
      'productId': instance.productId,
      'productName': instance.productName,
      'imageUrl': instance.imageUrl,
      'variantKey': instance.variantKey,
      'quantity': instance.quantity,
      'unitPrice': instance.unitPrice,
      'totalPrice': instance.totalPrice,
    };

_OrderTimelineEvent _$OrderTimelineEventFromJson(Map<String, dynamic> json) =>
    _OrderTimelineEvent(
      status: json['status'] as String,
      note: json['note'] as String?,
      occurredAt: DateTime.parse(json['occurredAt'] as String),
    );

Map<String, dynamic> _$OrderTimelineEventToJson(_OrderTimelineEvent instance) =>
    <String, dynamic>{
      'status': instance.status,
      'note': instance.note,
      'occurredAt': instance.occurredAt.toIso8601String(),
    };

_OrderAddress _$OrderAddressFromJson(Map<String, dynamic> json) =>
    _OrderAddress(
      fullName: json['fullName'] as String,
      line1: json['line1'] as String,
      line2: json['line2'] as String?,
      city: json['city'] as String,
      state: json['state'] as String,
      pincode: json['pincode'] as String,
      phone: json['phone'] as String,
    );

Map<String, dynamic> _$OrderAddressToJson(_OrderAddress instance) =>
    <String, dynamic>{
      'fullName': instance.fullName,
      'line1': instance.line1,
      'line2': instance.line2,
      'city': instance.city,
      'state': instance.state,
      'pincode': instance.pincode,
      'phone': instance.phone,
    };

_OrderDetail _$OrderDetailFromJson(Map<String, dynamic> json) => _OrderDetail(
  id: json['id'] as String,
  status: json['status'] as String,
  totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
  discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0,
  taxAmount: (json['taxAmount'] as num?)?.toDouble() ?? 0,
  shippingAmount: (json['shippingAmount'] as num?)?.toDouble() ?? 0,
  createdAt: DateTime.parse(json['createdAt'] as String),
  address: json['address'] == null
      ? null
      : OrderAddress.fromJson(json['address'] as Map<String, dynamic>),
  items:
      (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItemLine.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <OrderItemLine>[],
  timeline:
      (json['timeline'] as List<dynamic>?)
          ?.map((e) => OrderTimelineEvent.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <OrderTimelineEvent>[],
);

Map<String, dynamic> _$OrderDetailToJson(_OrderDetail instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': instance.status,
      'totalAmount': instance.totalAmount,
      'discountAmount': instance.discountAmount,
      'taxAmount': instance.taxAmount,
      'shippingAmount': instance.shippingAmount,
      'createdAt': instance.createdAt.toIso8601String(),
      'address': instance.address,
      'items': instance.items,
      'timeline': instance.timeline,
    };
