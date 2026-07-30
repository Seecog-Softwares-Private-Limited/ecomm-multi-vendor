// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CartProduct _$CartProductFromJson(Map<String, dynamic> json) => _CartProduct(
  id: json['id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String?,
  sellingPrice: (json['sellingPrice'] as num).toDouble(),
  mrp: (json['mrp'] as num).toDouble(),
  gstPercent: (json['gstPercent'] as num?)?.toDouble(),
  stock: (json['stock'] as num?)?.toInt() ?? 0,
  status: json['status'] as String? ?? 'ACTIVE',
  imageUrl: json['imageUrl'] as String?,
  listingPaused: json['listingPaused'] as bool? ?? false,
  sellerName: json['sellerName'] as String?,
);

Map<String, dynamic> _$CartProductToJson(_CartProduct instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'sellingPrice': instance.sellingPrice,
      'mrp': instance.mrp,
      'gstPercent': instance.gstPercent,
      'stock': instance.stock,
      'status': instance.status,
      'imageUrl': instance.imageUrl,
      'listingPaused': instance.listingPaused,
      'sellerName': instance.sellerName,
    };

_CartItem _$CartItemFromJson(Map<String, dynamic> json) => _CartItem(
  id: json['id'] as String,
  productId: json['productId'] as String,
  quantity: (json['quantity'] as num?)?.toInt() ?? 1,
  variantKey: json['variantKey'] as String?,
  product: CartProduct.fromJson(json['product'] as Map<String, dynamic>),
);

Map<String, dynamic> _$CartItemToJson(_CartItem instance) => <String, dynamic>{
  'id': instance.id,
  'productId': instance.productId,
  'quantity': instance.quantity,
  'variantKey': instance.variantKey,
  'product': instance.product,
};
