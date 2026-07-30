/// Notification preference toggles from GET/PATCH /api/notifications/preferences.
class NotificationPreferences {
  const NotificationPreferences({
    required this.orderUpdates,
    required this.payments,
    required this.offers,
    required this.wishlist,
    required this.security,
    required this.email,
    required this.sms,
    required this.push,
  });

  final bool orderUpdates;
  final bool payments;
  final bool offers;
  final bool wishlist;
  final bool security;
  final bool email;
  final bool sms;
  final bool push;

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) => NotificationPreferences(
        orderUpdates: json['orderUpdates'] == true,
        payments: json['payments'] == true,
        offers: json['offers'] == true,
        wishlist: json['wishlist'] == true,
        security: json['security'] == true,
        email: json['email'] == true,
        sms: json['sms'] == true,
        push: json['push'] == true,
      );

  NotificationPreferences copyWith({
    bool? orderUpdates,
    bool? payments,
    bool? offers,
    bool? wishlist,
    bool? security,
    bool? email,
    bool? sms,
    bool? push,
  }) {
    return NotificationPreferences(
      orderUpdates: orderUpdates ?? this.orderUpdates,
      payments: payments ?? this.payments,
      offers: offers ?? this.offers,
      wishlist: wishlist ?? this.wishlist,
      security: security ?? this.security,
      email: email ?? this.email,
      sms: sms ?? this.sms,
      push: push ?? this.push,
    );
  }
}

typedef PreferenceKey = ({
  String apiKey,
  String label,
  String subtitle,
});

const kNotificationPreferenceFields = <PreferenceKey>[
  (apiKey: 'orderUpdates', label: 'Order Updates', subtitle: 'Shipping, delivery and order status'),
  (apiKey: 'payments', label: 'Payments', subtitle: 'Payment confirmations and failures'),
  (apiKey: 'offers', label: 'Offers', subtitle: 'Deals and seller promotions'),
  (apiKey: 'wishlist', label: 'Wishlist', subtitle: 'Price drops and back-in-stock alerts'),
  (apiKey: 'security', label: 'Security', subtitle: 'Account and security alerts'),
  (apiKey: 'email', label: 'Email', subtitle: 'Receive notifications by email'),
  (apiKey: 'sms', label: 'SMS', subtitle: 'Receive notifications by SMS'),
  (apiKey: 'push', label: 'Push', subtitle: 'Receive push notifications on this device'),
];

bool readPreference(NotificationPreferences prefs, String apiKey) {
  return switch (apiKey) {
    'orderUpdates' => prefs.orderUpdates,
    'payments' => prefs.payments,
    'offers' => prefs.offers,
    'wishlist' => prefs.wishlist,
    'security' => prefs.security,
    'email' => prefs.email,
    'sms' => prefs.sms,
    'push' => prefs.push,
    _ => false,
  };
}

NotificationPreferences applyPreference(NotificationPreferences prefs, String apiKey, bool value) {
  return switch (apiKey) {
    'orderUpdates' => prefs.copyWith(orderUpdates: value),
    'payments' => prefs.copyWith(payments: value),
    'offers' => prefs.copyWith(offers: value),
    'wishlist' => prefs.copyWith(wishlist: value),
    'security' => prefs.copyWith(security: value),
    'email' => prefs.copyWith(email: value),
    'sms' => prefs.copyWith(sms: value),
    'push' => prefs.copyWith(push: value),
    _ => prefs,
  };
}

Map<String, bool> preferencePatch(String apiKey, bool value) => {apiKey: value};
