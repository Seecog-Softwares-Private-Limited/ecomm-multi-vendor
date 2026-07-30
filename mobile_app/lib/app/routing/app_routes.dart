/// Named route paths for the whole app.
abstract final class AppRoutes {
  const AppRoutes._();

  // Bootstrapping / auth
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String otpLogin = '/otp';
  static const String forgotPassword = '/forgot-password';
  static const String completeProfile = '/complete-profile';

  // Shell tabs
  static const String home = '/home';
  static const String categories = '/categories';
  static const String wishlist = '/wishlist';
  static const String cart = '/cart';
  static const String wishlistOverlay = '/overlay/wishlist';
  static const String cartOverlay = '/overlay/cart';
  static const String account = '/account';

  // Catalog
  static const String search = '/search';
  static const String category = '/category'; // /category/:id
  static const String product = '/product'; // /product/:id

  // Commerce
  static const String checkout = '/checkout';
  static const String orderSuccess = '/order-success';

  // Orders
  static const String orders = '/orders';
  static const String orderDetail = '/orders'; // /orders/:id

  // Account area
  static const String editProfile = '/account/edit';
  static const String addresses = '/account/addresses';
  static const String addressForm = '/account/addresses/form';
  static const String notifications = '/notifications';
  static const String notificationPreferences = '/notifications/settings';
  static const String support = '/account/support';
  static const String supportFaqs = '/account/support/faqs';
  static const String supportTickets = '/account/support/tickets';
  static const String supportCreateTicket = '/account/support/tickets/new';
  static const String settings = '/account/settings';
  static const String legal = '/legal'; // /legal/:slug

  static String categoryPath(String id) => '$category/$id';
  static String productPath(String id, {bool writeReview = false}) {
    final base = '$product/$id';
    return writeReview ? '$base?writeReview=1' : base;
  }
  static String orderPath(String id) => '$orders/$id';
  static String legalPath(String slug) => '$legal/$slug';
  static String supportTicketPath(String id) => '$supportTickets/$id';
  static String supportCreatePath({String? orderId, String? category}) {
    final params = <String, String>{};
    if (orderId != null && orderId.isNotEmpty) params['orderId'] = orderId;
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (params.isEmpty) return supportCreateTicket;
    return Uri(path: supportCreateTicket, queryParameters: params).toString();
  }
  static String supportFaqsPath({String? category, String? q}) {
    final params = <String, String>{};
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (q != null && q.isNotEmpty) params['q'] = q;
    if (params.isEmpty) return supportFaqs;
    return Uri(path: supportFaqs, queryParameters: params).toString();
  }

  static String afterAuth({required bool needsProfileCompletion}) =>
      needsProfileCompletion ? completeProfile : home;
}
