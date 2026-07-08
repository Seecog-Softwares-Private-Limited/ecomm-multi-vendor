// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Category _$CategoryFromJson(Map<String, dynamic> json) => _Category(
  id: json['id'] as String,
  slug: json['slug'] as String,
  name: json['name'] as String,
  icon: json['icon'] as String?,
  color: json['color'] as String?,
);

Map<String, dynamic> _$CategoryToJson(_Category instance) => <String, dynamic>{
  'id': instance.id,
  'slug': instance.slug,
  'name': instance.name,
  'icon': instance.icon,
  'color': instance.color,
};

_SubCategory _$SubCategoryFromJson(Map<String, dynamic> json) => _SubCategory(
  id: json['id'] as String,
  slug: json['slug'] as String,
  name: json['name'] as String,
  icon: json['icon'] as String? ?? '',
);

Map<String, dynamic> _$SubCategoryToJson(_SubCategory instance) =>
    <String, dynamic>{
      'id': instance.id,
      'slug': instance.slug,
      'name': instance.name,
      'icon': instance.icon,
    };

_CategoryTree _$CategoryTreeFromJson(Map<String, dynamic> json) =>
    _CategoryTree(
      id: json['id'] as String,
      slug: json['slug'] as String,
      name: json['name'] as String,
      icon: json['icon'] as String?,
      color: json['color'] as String?,
      subcategories:
          (json['subcategories'] as List<dynamic>?)
              ?.map((e) => SubCategory.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <SubCategory>[],
    );

Map<String, dynamic> _$CategoryTreeToJson(_CategoryTree instance) =>
    <String, dynamic>{
      'id': instance.id,
      'slug': instance.slug,
      'name': instance.name,
      'icon': instance.icon,
      'color': instance.color,
      'subcategories': instance.subcategories,
    };
