import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/entities/address.dart';
import '../addresses_controller.dart';
import 'address_form_page.dart';

class AddressesPage extends ConsumerWidget {
  const AddressesPage({this.selectable = false, this.onSelected, super.key});

  final bool selectable;
  final void Function(Address address)? onSelected;

  Future<void> _openForm(BuildContext context, {Address? existing}) {
    return Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => AddressFormPage(existing: existing)),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(addressesControllerProvider);
    return Scaffold(
      appBar: AppBar(title: Text(selectable ? 'Select address' : 'My addresses')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(context),
        icon: const Icon(Icons.add),
        label: const Text('Add new'),
      ),
      body: async.when(
        loading: () => const AppLoader(),
        error: (error, _) => ErrorStateView(
          message: 'Could not load addresses.',
          onRetry: () => ref.invalidate(addressesControllerProvider),
        ),
        data: (addresses) {
          if (addresses.isEmpty) {
            return EmptyStateView(
              title: 'No saved addresses',
              message: 'Add a delivery address to speed up checkout.',
              icon: Icons.location_on_outlined,
              actionLabel: 'Add address',
              onAction: () => _openForm(context),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: addresses.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, i) {
              final address = addresses[i];
              return _AddressCard(
                address: address,
                onEdit: () => _openForm(context, existing: address),
                onDelete: () async {
                  await ref.read(addressesControllerProvider.notifier).delete(address.id);
                  if (context.mounted) context.showSnack('Address removed');
                },
                onSelect: selectable ? () => onSelected?.call(address) : null,
              );
            },
          );
        },
      ),
    );
  }
}

class _AddressCard extends StatelessWidget {
  const _AddressCard({
    required this.address,
    required this.onEdit,
    required this.onDelete,
    required this.onSelect,
  });

  final Address address;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback? onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Card(
      child: InkWell(
        onTap: onSelect,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(address.fullName, style: theme.textTheme.titleSmall),
                  const SizedBox(width: AppSpacing.sm),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: adaptive.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppRadius.xs),
                    ),
                    child: Text(address.name, style: theme.textTheme.labelSmall),
                  ),
                  if (address.isDefault) ...[
                    const SizedBox(width: AppSpacing.sm),
                    const Icon(Icons.check_circle, size: 16, color: AppColors.success),
                  ],
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                address.formatted,
                style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text('Phone: ${address.phone}', style: theme.textTheme.bodySmall),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  if (onSelect != null)
                    Expanded(
                      child: AppButton(
                        label: 'Deliver here',
                        onPressed: onSelect,
                      ),
                    ),
                  if (onSelect == null) ...[
                    TextButton.icon(onPressed: onEdit, icon: const Icon(Icons.edit, size: 16), label: const Text('Edit')),
                    TextButton.icon(
                      onPressed: onDelete,
                      icon: const Icon(Icons.delete_outline, size: 16),
                      label: const Text('Delete'),
                    ),
                  ],
                ],
              ),
              if (onSelect != null)
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(onPressed: onEdit, child: const Text('Edit')),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
