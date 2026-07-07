class Product {
  const Product({
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
}
