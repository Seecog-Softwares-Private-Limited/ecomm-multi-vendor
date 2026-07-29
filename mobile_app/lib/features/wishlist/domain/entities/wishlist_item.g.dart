// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wishlist_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_WishlistProduct _$WishlistProductFromJson(Map<String, dynamic> json) =>
    _WishlistProduct(
      id: json['id'] as String,
      name: json['name'] as String,
      sellingPrice: (json['sellingPrice'] as num).toDouble(),
      mrp: (json['mrp'] as num).toDouble(),
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? 'ACTIVE',
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      sellerName: json['sellerName'] as String?,
      discountPercent: (json['discountPercent'] as num?)?.toInt() ?? 0,
      imageUrl: json['imageUrl'] as String?,
      listingPaused: json['listingPaused'] as bool? ?? false,
    );

Map<String, dynamic> _$WishlistProductToJson(_WishlistProduct instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'sellingPrice': instance.sellingPrice,
      'mrp': instance.mrp,
      'stock': instance.stock,
      'status': instance.status,
      'avgRating': instance.avgRating,
      'reviewCount': instance.reviewCount,
      'sellerName': instance.sellerName,
      'discountPercent': instance.discountPercent,
      'imageUrl': instance.imageUrl,
      'listingPaused': instance.listingPaused,
    };

_WishlistItem _$WishlistItemFromJson(Map<String, dynamic> json) =>
    _WishlistItem(
      id: json['id'] as String,
      productId: json['productId'] as String,
      variantKey: json['variantKey'] as String?,
      product: WishlistProduct.fromJson(
        json['product'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$WishlistItemToJson(_WishlistItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'productId': instance.productId,
      'variantKey': instance.variantKey,
      'product': instance.product,
    };
