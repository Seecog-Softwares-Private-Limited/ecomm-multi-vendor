/// Central registry of backend API paths (relative to the configured base URL).
/// Keeps endpoint strings in one place and avoids scattering literals.
abstract final class ApiEndpoints {
  const ApiEndpoints._();

  // Auth
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String me = '/api/auth/me';
  static const String forgotPassword = '/api/auth/forgot-password';
  static const String sendOtp = '/api/auth/send-otp';
  static const String verifyOtp = '/api/auth/verify-otp';

  // Profile
  static const String completeProfileDetails = '/api/profile/complete-details';
  static const String avatarUpload = '/api/auth/me/avatar';
  static const String products = '/api/products';
  static String productById(String id) => '/api/products/$id';
  static String productBySlug(String slug) => '/api/products/slug/$slug';
  static String productReviews(String id) => '/api/products/$id/reviews';
  static const String categories = '/api/categories';
  static const String brands = '/api/products/brands';

  // Cart
  static const String cartItems = '/api/cart/items';
  static String cartItem(String id) => '/api/cart/items/$id';

  // Wishlist
  static const String wishlist = '/api/wishlist';
  static String wishlistItem(String id) => '/api/wishlist/$id';

  // Addresses
  static const String addresses = '/api/addresses';
  static String address(String id) => '/api/addresses/$id';

  // Orders
  static const String orders = '/api/orders';
  static String order(String id) => '/api/orders/$id';

  // Support / CMS
  static const String supportTickets = '/api/support-tickets';
  static String footerPage(String slug) => '/api/cms/footer-pages/$slug';
}
