import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../cart/presentation/commerce_actions.dart';
import '../../../catalog/presentation/catalog_providers.dart';
import '../../../catalog/presentation/product_filters.dart';
import '../../../catalog/presentation/widgets/filter_sheet.dart';
import '../../../catalog/presentation/widgets/paginated_product_grid.dart';
import '../../../wishlist/presentation/wishlist_controller.dart';
import '../recent_searches_controller.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  String? _submittedQuery;
  ProductFilters _filters = const ProductFilters();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _focusNode.requestFocus());
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _submit(String raw) {
    final query = raw.trim();
    if (!Validators.isSearchable(query)) {
      context.showSnack('Please enter something to search.', isError: true);
      return;
    }
    _controller.text = query;
    ref.read(recentSearchesProvider.notifier).add(query);
    setState(() => _submittedQuery = query);
    _focusNode.unfocus();
  }

  Future<void> _openFilters() async {
    final result = await showFilterSheet(context, _filters);
    if (result != null && mounted) setState(() => _filters = result);
  }

  void _clearQuery() {
    _controller.clear();
    setState(() => _submittedQuery = null);
    _focusNode.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final showResults = _submittedQuery != null;
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: _SearchField(
          controller: _controller,
          focusNode: _focusNode,
          onSubmitted: _submit,
          onClear: _clearQuery,
          onChanged: (_) => setState(() {}),
        ),
        actions: [
          if (showResults)
            Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: _FilterButton(count: _filters.activeCount, onTap: _openFilters),
            ),
        ],
      ),
      body: showResults ? _buildResults() : _buildSuggestions(),
    );
  }

  Widget _buildResults() {
    final query = _submittedQuery!;
    final repo = ref.read(catalogRepositoryProvider);
    final wishlisted = ref.watch(wishlistedIdsProvider);
    return PaginatedProductGrid(
      key: ValueKey('search-$query'),
      fetcher: (offset, limit) => repo.fetchProducts(query: query, limit: limit, offset: offset),
      transform: _filters.apply,
      onProductTap: (p) => context.push(AppRoutes.productPath(p.slug)),
      isWishlisted: (p) => wishlisted.contains(p.id),
      onWishlistTap: (p) => ref.toggleWishlist(context, p.id),
      emptyTitle: 'No results for "$query"',
      emptyMessage: 'Try a different search term or adjust your filters.',
    );
  }

  Widget _buildSuggestions() {
    final recent = ref.watch(recentSearchesProvider);
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        if (recent.isNotEmpty) ...[
          Row(
            children: [
              Expanded(child: Text('Recent searches', style: theme.textTheme.titleSmall)),
              TextButton(
                onPressed: () => ref.read(recentSearchesProvider.notifier).clear(),
                child: const Text('Clear all'),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          for (final term in recent)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.history, color: AppColors.textMuted),
              title: Text(term),
              trailing: IconButton(
                icon: const Icon(Icons.close, size: 18),
                onPressed: () => ref.read(recentSearchesProvider.notifier).remove(term),
              ),
              onTap: () => _submit(term),
            ),
          const SizedBox(height: AppSpacing.lg),
        ],
        Text('Popular searches', style: theme.textTheme.titleSmall),
        const SizedBox(height: AppSpacing.md),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: [
            for (final term in kPopularSearches)
              ActionChip(
                avatar: const Icon(Icons.trending_up, size: 16),
                label: Text(term),
                onPressed: () => _submit(term),
              ),
          ],
        ),
      ],
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({
    required this.controller,
    required this.focusNode,
    required this.onSubmitted,
    required this.onClear,
    required this.onChanged,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onSubmitted;
  final VoidCallback onClear;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
      textInputAction: TextInputAction.search,
      onSubmitted: onSubmitted,
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: 'Search products',
        filled: false,
        border: InputBorder.none,
        enabledBorder: InputBorder.none,
        focusedBorder: InputBorder.none,
        prefixIcon: const Icon(Icons.search),
        suffixIcon: controller.text.isEmpty
            ? null
            : IconButton(icon: const Icon(Icons.close), onPressed: onClear),
      ),
    );
  }
}

class _FilterButton extends StatelessWidget {
  const _FilterButton({required this.count, required this.onTap});

  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Badge(
      isLabelVisible: count > 0,
      label: Text('$count'),
      child: IconButton(
        onPressed: onTap,
        icon: const Icon(Icons.tune),
        tooltip: 'Sort & filter',
      ),
    );
  }
}
