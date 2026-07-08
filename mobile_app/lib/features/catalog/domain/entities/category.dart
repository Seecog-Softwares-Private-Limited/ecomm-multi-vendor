import 'package:freezed_annotation/freezed_annotation.dart';

part 'category.freezed.dart';
part 'category.g.dart';

@freezed
abstract class Category with _$Category {
  const factory Category({
    required String id,
    required String slug,
    required String name,
    String? icon,
    String? color,
  }) = _Category;

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
}

@freezed
abstract class SubCategory with _$SubCategory {
  const factory SubCategory({
    required String id,
    required String slug,
    required String name,
    @Default('') String icon,
  }) = _SubCategory;

  factory SubCategory.fromJson(Map<String, dynamic> json) => _$SubCategoryFromJson(json);
}

@freezed
abstract class CategoryTree with _$CategoryTree {
  const factory CategoryTree({
    required String id,
    required String slug,
    required String name,
    String? icon,
    String? color,
    @Default(<SubCategory>[]) List<SubCategory> subcategories,
  }) = _CategoryTree;

  factory CategoryTree.fromJson(Map<String, dynamic> json) => _$CategoryTreeFromJson(json);
}
