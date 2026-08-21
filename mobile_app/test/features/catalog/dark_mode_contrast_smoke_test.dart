import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/core/theme/app_adaptive_colors.dart';
import 'package:indovyapar_customer/core/theme/app_colors.dart';
import 'package:indovyapar_customer/features/cart/presentation/cart_controller.dart';
import 'package:indovyapar_customer/features/cart/presentation/widgets/cart_summary_card.dart';
import 'package:indovyapar_customer/features/catalog/domain/entities/product.dart';
import 'package:indovyapar_customer/features/catalog/presentation/widgets/product_card.dart';
import 'package:indovyapar_customer/features/commerce/presentation/widgets/quantity_stepper.dart';
import 'package:indovyapar_customer/features/home/presentation/widgets/home_search_bar.dart';

ThemeData _theme(Brightness brightness) {
  final isDark = brightness == Brightness.dark;
  final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimary;
  final surface = isDark ? AppColors.surfaceDark : AppColors.surface;
  final background = isDark ? AppColors.backgroundDark : AppColors.background;
  final border = isDark ? AppColors.borderDark : AppColors.border;
  final adaptive = isDark ? AppAdaptiveColors.dark : AppAdaptiveColors.light;

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    scaffoldBackgroundColor: background,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
      primary: AppColors.primary,
      surface: surface,
      onSurface: textColor,
      outline: border,
    ),
    cardTheme: CardThemeData(color: surface),
    textTheme: Typography.material2021(platform: TargetPlatform.android).black.apply(
          bodyColor: textColor,
          displayColor: textColor,
        ),
    extensions: [adaptive],
  );
}

Widget _wrap(Brightness brightness, Widget child) {
  return MaterialApp(
    theme: _theme(brightness),
    home: Scaffold(body: child),
  );
}

void main() {
  final product = Product(
    id: 'p1',
    name: 'Test Headphones',
    price: 1499,
    oldPrice: 2499,
    rating: 4.6,
    reviews: 10,
    slug: 'test-headphones',
  );

  const summary = CartSummary(
    subtotal: 1499,
    savings: 1000,
    shipping: 0,
    tax: 0,
    couponDiscount: 0,
  );

  testWidgets('dark mode uses adaptive muted/secondary colors on product card', (tester) async {
    await tester.pumpWidget(
      _wrap(
        Brightness.dark,
        SizedBox(
          width: 180,
          height: 320,
          child: ProductCard(
            product: product,
            onTap: () {},
            onWishlistTap: () {},
          ),
        ),
      ),
    );
    await tester.pump();

    final heart = tester.widget<Icon>(find.byIcon(Icons.favorite_border));
    expect(heart.color, AppColors.textSecondaryDark);

    final oldPrice = tester.widget<Text>(find.textContaining('2,499'));
    expect(oldPrice.style?.color, AppColors.textMutedDark);
  });

  testWidgets('light mode product card keeps light muted/secondary colors', (tester) async {
    await tester.pumpWidget(
      _wrap(
        Brightness.light,
        SizedBox(
          width: 180,
          height: 320,
          child: ProductCard(
            product: product,
            onTap: () {},
            onWishlistTap: () {},
          ),
        ),
      ),
    );
    await tester.pump();

    final heart = tester.widget<Icon>(find.byIcon(Icons.favorite_border));
    expect(heart.color, AppColors.textSecondary);

    final oldPrice = tester.widget<Text>(find.textContaining('2,499'));
    expect(oldPrice.style?.color, AppColors.textMuted);
  });

  testWidgets('home search bar icons use adaptive muted in dark mode', (tester) async {
    await tester.pumpWidget(_wrap(Brightness.dark, HomeSearchBar(onTap: () {})));
    await tester.pump();

    final searchIcon = tester.widget<Icon>(find.byIcon(Icons.search));
    expect(searchIcon.color, AppColors.textMutedDark);
  });

  testWidgets('quantity stepper border uses adaptive border in dark mode', (tester) async {
    await tester.pumpWidget(
      _wrap(Brightness.dark, QuantityStepper(quantity: 1, onChanged: (_) {})),
    );
    await tester.pump();

    final container = tester.widget<Container>(find.byType(Container).first);
    final decoration = container.decoration! as BoxDecoration;
    expect((decoration.border! as Border).top.color, AppColors.borderDark);
  });

  testWidgets('cart summary labels use adaptive secondary in dark mode', (tester) async {
    await tester.pumpWidget(_wrap(Brightness.dark, CartSummaryCard(summary: summary)));
    await tester.pump();

    final label = tester.widget<Text>(find.text('Items Total'));
    expect(label.style?.color, AppColors.textSecondaryDark);
  });

  testWidgets('cart summary labels keep light secondary in light mode', (tester) async {
    await tester.pumpWidget(_wrap(Brightness.light, CartSummaryCard(summary: summary)));
    await tester.pump();

    final label = tester.widget<Text>(find.text('Items Total'));
    expect(label.style?.color, AppColors.textSecondary);
  });
}
