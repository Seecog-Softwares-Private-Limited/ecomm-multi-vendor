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
  static String productReviewSummary(String id) => '/api/products/$id/reviews/summary';
  static String reviewHelpful(String id) => '/api/reviews/$id/helpful';
  static const String categories = '/api/categories';
  static const String brands = '/api/products/brands';

  // Cart
  static const String cartItems = '/api/cart/items';
  static const String cartMerge = '/api/cart/merge';
  static const String cartSaved = '/api/cart/saved';
  static String cartItem(String id) => '/api/cart/items/$id';

  // Checkout sessions
  static const String checkoutSessions = '/api/checkout/sessions';
  static String checkoutSession(String id) => '/api/checkout/sessions/$id';

  // Wishlist
  static const String wishlist = '/api/wishlist';
  static String wishlistItem(String id) => '/api/wishlist/$id';

  // Addresses
  static const String addresses = '/api/addresses';
  static String address(String id) => '/api/addresses/$id';

  // Orders
  static const String orders = '/api/orders';
  static String order(String id) => '/api/orders/$id';

  // Payments (Razorpay)
  static const String razorpayOrder = '/api/payments/razorpay-order';
  static const String verifyPayment = '/api/payments/verify';

  // Notifications
  static const String notifications = '/api/notifications';
  static String notification(String id) => '/api/notifications/$id';
  static const String notificationPreferences = '/api/notifications/preferences';

  // Support / CMS
  static const String supportTickets = '/api/support-tickets';
  static String supportTicket(String id) => '/api/support-tickets/$id';
  static String supportTicketMessages(String id) => '/api/support-tickets/$id/messages';
  static String supportTicketReply(String id) => '/api/support-tickets/$id/reply';
  static const String faqs = '/api/faqs';
  static String footerPage(String slug) => '/api/cms/footer-pages/$slug';
}
