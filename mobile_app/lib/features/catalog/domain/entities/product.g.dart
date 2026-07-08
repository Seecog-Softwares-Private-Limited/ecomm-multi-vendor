// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Product _$ProductFromJson(Map<String, dynamic> json) => _Product(
  id: json['id'] as String,
  name: json['name'] as String,
  price: (json['price'] as num).toDouble(),
  oldPrice: (json['oldPrice'] as num?)?.toDouble(),
  rating: (json['rating'] as num?)?.toDouble() ?? 0,
  reviews: (json['reviews'] as num?)?.toInt() ?? 0,
  slug: json['slug'] as String,
  imageUrl: json['imageUrl'] as String?,
);

Map<String, dynamic> _$ProductToJson(_Product instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'price': instance.price,
  'oldPrice': instance.oldPrice,
  'rating': instance.rating,
  'reviews': instance.reviews,
  'slug': instance.slug,
  'imageUrl': instance.imageUrl,
};

_SpecItem _$SpecItemFromJson(Map<String, dynamic> json) =>
    _SpecItem(label: json['label'] as String, value: json['value'] as String);

Map<String, dynamic> _$SpecItemToJson(_SpecItem instance) => <String, dynamic>{
  'label': instance.label,
  'value': instance.value,
};

_VariationItem _$VariationItemFromJson(Map<String, dynamic> json) =>
    _VariationItem(
      name: json['name'] as String,
      values:
          (json['values'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
    );

Map<String, dynamic> _$VariationItemToJson(_VariationItem instance) =>
    <String, dynamic>{'name': instance.name, 'values': instance.values};

_SkuVariant _$SkuVariantFromJson(Map<String, dynamic> json) => _SkuVariant(
  id: json['id'] as String,
  color: json['color'] as String?,
  size: json['size'] as String?,
  price: (json['price'] as num).toDouble(),
  stock: (json['stock'] as num).toInt(),
  sku: json['sku'] as String?,
  image: json['image'] as String?,
  images:
      (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const <String>[],
);

Map<String, dynamic> _$SkuVariantToJson(_SkuVariant instance) =>
    <String, dynamic>{
      'id': instance.id,
      'color': instance.color,
      'size': instance.size,
      'price': instance.price,
      'stock': instance.stock,
      'sku': instance.sku,
      'image': instance.image,
      'images': instance.images,
    };

_ProductDetail _$ProductDetailFromJson(Map<String, dynamic> json) =>
    _ProductDetail(
      id: json['id'] as String,
      sellerId: json['sellerId'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      mrp: (json['mrp'] as num).toDouble(),
      stock: (json['stock'] as num).toInt(),
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      images:
          (json['images'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
      specifications:
          (json['specifications'] as List<dynamic>?)
              ?.map((e) => SpecItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <SpecItem>[],
      variations:
          (json['variations'] as List<dynamic>?)
              ?.map((e) => VariationItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <VariationItem>[],
      skuVariants:
          (json['skuVariants'] as List<dynamic>?)
              ?.map((e) => SkuVariant.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <SkuVariant>[],
    );

Map<String, dynamic> _$ProductDetailToJson(_ProductDetail instance) =>
    <String, dynamic>{
      'id': instance.id,
      'sellerId': instance.sellerId,
      'name': instance.name,
      'slug': instance.slug,
      'description': instance.description,
      'price': instance.price,
      'mrp': instance.mrp,
      'stock': instance.stock,
      'avgRating': instance.avgRating,
      'reviewCount': instance.reviewCount,
      'images': instance.images,
      'specifications': instance.specifications,
      'variations': instance.variations,
      'skuVariants': instance.skuVariants,
    };

_Review _$ReviewFromJson(Map<String, dynamic> json) => _Review(
  id: json['id'] as String,
  user: json['user'] as String,
  rating: (json['rating'] as num?)?.toInt() ?? 0,
  date: json['date'] as String,
  comment: json['comment'] as String?,
  verified: json['verified'] as bool? ?? false,
  helpful: (json['helpful'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$ReviewToJson(_Review instance) => <String, dynamic>{
  'id': instance.id,
  'user': instance.user,
  'rating': instance.rating,
  'date': instance.date,
  'comment': instance.comment,
  'verified': instance.verified,
  'helpful': instance.helpful,
};
