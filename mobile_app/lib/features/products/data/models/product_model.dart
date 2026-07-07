import '../../domain/entities/product.dart';

class ProductModel {
  const ProductModel({
    required this.id,
    required this.title,
    required this.price,
    required this.stock,
    required this.imageUrl,
  });

  final String id;
  final String title;
  final double price;
  final int stock;
  final String imageUrl;

  factory ProductModel.fromMap(Map<String, dynamic> map) {
    final name = map['name']?.toString() ?? map['title']?.toString() ?? 'Untitled Product';
    return ProductModel(
      id: map['id']?.toString() ?? '',
      title: name,
      price: (map['price'] as num?)?.toDouble() ?? 0,
      stock: (map['stock'] as num?)?.toInt() ?? 0,
      imageUrl: map['imageUrl']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'price': price,
      'stock': stock,
      'imageUrl': imageUrl,
    };
  }

  Product toEntity() {
    return Product(
      id: id,
      title: title,
      price: price,
      stock: stock,
      imageUrl: imageUrl,
    );
  }
}
