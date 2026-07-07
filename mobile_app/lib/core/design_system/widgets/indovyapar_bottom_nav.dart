import 'package:flutter/material.dart';

import '../tokens/app_brand.dart';
import '../tokens/app_colors.dart';

enum IndovyaparNavKey { home, categories, orders, cart, more }

class IndovyaparBottomNav extends StatelessWidget {
  const IndovyaparBottomNav({
    required this.activeKey,
    required this.onHomeTap,
    required this.onCategoriesTap,
    required this.onOrdersTap,
    required this.onCartTap,
    required this.onMoreTap,
    super.key,
    this.showOrders = true,
    this.cartCount = 0,
    this.moreActive = false,
  });

  final IndovyaparNavKey activeKey;
  final VoidCallback onHomeTap;
  final VoidCallback onCategoriesTap;
  final VoidCallback onOrdersTap;
  final VoidCallback onCartTap;
  final VoidCallback onMoreTap;
  final bool showOrders;
  final int cartCount;
  final bool moreActive;

  @override
  Widget build(BuildContext context) {
    final items = <_NavItem>[
      _NavItem(
        key: IndovyaparNavKey.home,
        icon: Icons.home_outlined,
        label: 'Home',
        color: AppColors.navHome,
        onTap: onHomeTap,
      ),
      _NavItem(
        key: IndovyaparNavKey.categories,
        icon: Icons.grid_view_outlined,
        label: 'Categories',
        color: AppColors.navCategories,
        onTap: onCategoriesTap,
      ),
      if (showOrders)
        _NavItem(
          key: IndovyaparNavKey.orders,
          icon: Icons.receipt_long_outlined,
          label: 'Orders',
          color: AppColors.navOrders,
          onTap: onOrdersTap,
        ),
      _NavItem(
        key: IndovyaparNavKey.cart,
        icon: Icons.shopping_cart_outlined,
        label: 'Cart',
        color: AppColors.navCart,
        onTap: onCartTap,
        badgeCount: cartCount,
        neverActive: true,
      ),
      _NavItem(
        key: IndovyaparNavKey.more,
        icon: Icons.menu,
        label: 'More',
        color: AppColors.textPrimary,
        onTap: onMoreTap,
        forceActive: moreActive,
      ),
    ];

    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.92),
        border: Border(
          top: BorderSide(color: Colors.white.withValues(alpha: 0.6)),
        ),
        boxShadow: const [AppBrand.bottomNavShadow],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 68,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.map((item) => _NavButton(item: item, activeKey: activeKey)).toList(),
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({required this.item, required this.activeKey});

  final _NavItem item;
  final IndovyaparNavKey activeKey;

  @override
  Widget build(BuildContext context) {
    final selected = item.forceActive || (!item.neverActive && activeKey == item.key);
    final labelColor = selected ? item.color : AppColors.textMuted;

    return Expanded(
      child: Material(
        color: selected ? Colors.white.withValues(alpha: 0.8) : Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: item.onTap,
          borderRadius: BorderRadius.circular(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    item.icon,
                    size: 20,
                    color: item.color.withValues(alpha: selected ? 1 : 0.72),
                  ),
                  if (item.badgeCount > 0)
                    Positioned(
                      top: -6,
                      right: -8,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          child: Text(
                            item.badgeCount > 99 ? '99+' : '${item.badgeCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                  color: item.key == IndovyaparNavKey.more && selected
                      ? AppColors.textPrimary
                      : labelColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({
    required this.key,
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.badgeCount = 0,
    this.neverActive = false,
    this.forceActive = false,
  });

  final IndovyaparNavKey key;
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final int badgeCount;
  final bool neverActive;
  final bool forceActive;
}
