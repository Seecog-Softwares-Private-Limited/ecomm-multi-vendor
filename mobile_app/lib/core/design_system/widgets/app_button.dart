import 'package:flutter/material.dart';

import '../tokens/app_colors.dart';
import '../tokens/app_radius.dart';
import '../tokens/app_spacing.dart';
import 'indovyapar_logo.dart';

enum AppButtonVariant { primary, outline }

class AppButton extends StatelessWidget {
  const AppButton({
    required this.label,
    required this.onPressed,
    super.key,
    this.leading,
    this.isLoading = false,
    this.expanded = false,
    this.variant = AppButtonVariant.primary,
  });

  final String label;
  final VoidCallback? onPressed;
  final Widget? leading;
  final bool isLoading;
  final bool expanded;
  final AppButtonVariant variant;

  @override
  Widget build(BuildContext context) {
    final enabled = !isLoading && onPressed != null;
    final labelWidget = isLoading
        ? SizedBox(
            height: 18,
            width: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: variant == AppButtonVariant.primary
                  ? Colors.white
                  : AppColors.primary,
            ),
          )
        : Text(label);

    final Widget button;
    switch (variant) {
      case AppButtonVariant.primary:
        button = leading == null
            ? FilledButton(
                onPressed: enabled ? onPressed : null,
                child: labelWidget,
              )
            : FilledButton.icon(
                onPressed: enabled ? onPressed : null,
                icon: leading!,
                label: labelWidget,
              );
      case AppButtonVariant.outline:
        button = leading == null
            ? OutlinedButton(
                onPressed: enabled ? onPressed : null,
                child: labelWidget,
              )
            : OutlinedButton.icon(
                onPressed: enabled ? onPressed : null,
                icon: leading!,
                label: labelWidget,
              );
    }

    if (expanded) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}

class AppBrandAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AppBrandAppBar({
    super.key,
    this.title,
    this.showLogo = true,
    this.actions,
  });

  final Widget? title;
  final bool showLogo;
  final List<Widget>? actions;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.brandGreen,
      foregroundColor: Colors.white,
      elevation: 0,
      title: title ??
          (showLogo
              ? const IndovyaparLogo(
                  fontSize: 24,
                  variant: IndovyaparLogoVariant.light,
                )
              : null),
      actions: actions,
    );
  }
}

class AppPageBackground extends StatelessWidget {
  const AppPageBackground({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.background,
      child: child,
    );
  }
}

class AppFormCard extends StatelessWidget {
  const AppFormCard({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.8)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A64748B),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: child,
      ),
    );
  }
}
