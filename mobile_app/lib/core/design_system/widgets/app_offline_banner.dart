import 'package:flutter/material.dart';

import '../tokens/app_spacing.dart';

class AppOfflineBanner extends StatelessWidget {
  const AppOfflineBanner({
    required this.isOffline,
    required this.isFromCache,
    super.key,
  });

  final bool isOffline;
  final bool isFromCache;

  @override
  Widget build(BuildContext context) {
    if (!isOffline && !isFromCache) {
      return const SizedBox.shrink();
    }

    final message = isOffline
        ? 'You are offline. Showing cached products.'
        : 'Showing cached products while the network recovers.';

    return MaterialBanner(
      content: Text(message),
      leading: Icon(
        isOffline ? Icons.cloud_off : Icons.cloud_download_outlined,
        color: Theme.of(context).colorScheme.primary,
      ),
      actions: const [SizedBox.shrink()],
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
    );
  }
}
