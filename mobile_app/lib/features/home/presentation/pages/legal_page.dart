import 'package:flutter/material.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

/// Static informational pages (Privacy Policy, Terms, About). Content is bundled
/// so these are always available offline.
class LegalPage extends StatelessWidget {
  const LegalPage({required this.slug, super.key});

  final String slug;

  ({String title, List<(String, String)> sections}) get _content {
    switch (slug) {
      case 'terms':
        return (
          title: 'Terms of Service',
          sections: [
            ('Acceptance', 'By using ${AppConstants.appName} you agree to these terms and our policies. Please read them carefully before shopping.'),
            ('Orders', 'All orders are subject to acceptance and availability. Prices and offers may change without notice.'),
            ('Payments', 'We support Cash on Delivery, UPI and cards. Online payments are processed securely by our payment partners.'),
            ('Returns', 'Eligible items can be returned within 7 days of delivery. Some categories are non-returnable for hygiene reasons.'),
            ('Liability', 'We act as a marketplace connecting you with sellers and are not liable for indirect damages beyond the order value.'),
          ],
        );
      case 'about':
        return (
          title: 'About ${AppConstants.appName}',
          sections: [
            ('Our mission', '${AppConstants.appName} brings local businesses online, helping customers discover quality products at fair prices.'),
            ('Why shop with us', 'Verified sellers, secure payments, fast delivery and friendly support — everything you need for a great shopping experience.'),
            ('Contact', 'Reach us at support@indovyapar.com or call 1800-123-4567 (9am – 8pm, all days).'),
          ],
        );
      case 'privacy':
      default:
        return (
          title: 'Privacy Policy',
          sections: [
            ('Information we collect', 'We collect the details you provide (name, email, phone, addresses) and order activity to run the service.'),
            ('How we use it', 'Your data is used to process orders, provide support, personalize recommendations and improve the app.'),
            ('Sharing', 'We share only what sellers and delivery partners need to fulfil your orders. We never sell your personal data.'),
            ('Security', 'Sessions are protected with encrypted tokens and secure storage on your device.'),
            ('Your choices', 'You can edit your profile, manage addresses, or delete your account at any time from the app.'),
          ],
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final content = _content;
    return Scaffold(
      appBar: AppBar(title: Text(content.title)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          for (final section in content.sections) ...[
            Text(section.$1, style: theme.textTheme.titleMedium),
            const SizedBox(height: AppSpacing.xs),
            Text(section.$2,
                style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary, height: 1.5)),
            const SizedBox(height: AppSpacing.lg),
          ],
        ],
      ),
    );
  }
}
