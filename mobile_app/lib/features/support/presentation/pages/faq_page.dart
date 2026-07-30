import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/faq_item.dart';
import '../support_controller.dart';
import '../widgets/faq_expandable_card.dart';
import '../widgets/support_empty_state.dart';
import '../widgets/support_skeletons.dart';

class FaqPage extends ConsumerStatefulWidget {
  const FaqPage({this.initialCategory, this.initialQuery, super.key});

  final String? initialCategory;
  final String? initialQuery;

  @override
  ConsumerState<FaqPage> createState() => _FaqPageState();
}

class _FaqPageState extends ConsumerState<FaqPage> {
  late final TextEditingController _search;

  @override
  void initState() {
    super.initState();
    _search = TextEditingController(text: widget.initialQuery ?? '');
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.initialCategory != null && widget.initialCategory!.isNotEmpty) {
        ref.read(faqCategoryFilterProvider.notifier).update(widget.initialCategory!);
      }
      if (widget.initialQuery != null && widget.initialQuery!.isNotEmpty) {
        ref.read(faqSearchQueryProvider.notifier).update(widget.initialQuery!);
      }
    });
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    final category = ref.watch(faqCategoryFilterProvider);
    final query = ref.watch(faqSearchQueryProvider);
    final faqsAsync = ref.watch(filteredFaqsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('FAQs')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 0),
            child: Semantics(
              textField: true,
              label: 'Search FAQs',
              child: TextField(
                controller: _search,
                textInputAction: TextInputAction.search,
                onChanged: (v) => ref.read(faqSearchQueryProvider.notifier).update(v),
                decoration: InputDecoration(
                  hintText: 'Search questions…',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: query.isEmpty
                      ? null
                      : IconButton(
                          tooltip: 'Clear',
                          onPressed: () {
                            _search.clear();
                            ref.read(faqSearchQueryProvider.notifier).update('');
                          },
                          icon: const Icon(Icons.close),
                        ),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              itemCount: FaqCategories.ordered.length,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
              itemBuilder: (context, index) {
                final id = FaqCategories.ordered[index];
                final selected = category == id;
                return FilterChip(
                  selected: selected,
                  label: Text(FaqCategories.label(id)),
                  onSelected: (_) => ref.read(faqCategoryFilterProvider.notifier).update(id),
                  showCheckmark: false,
                  selectedColor: adaptive.primarySurface,
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Expanded(
            child: faqsAsync.when(
              loading: () => const FaqListSkeleton(),
              error: (error, _) => ErrorStateView(
                message: 'Could not load FAQs. Check your connection and try again.',
                onRetry: () => ref.invalidate(faqsProvider),
              ),
              data: (faqs) {
                if (faqs.isEmpty) {
                  return SupportEmptyState(
                    kind: query.isNotEmpty || category != FaqCategories.all
                        ? SupportEmptyKind.search
                        : SupportEmptyKind.faqs,
                    onAction: query.isEmpty && category == FaqCategories.all
                        ? () => context.push(AppRoutes.supportCreateTicket)
                        : null,
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(faqsProvider),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      0,
                      AppSpacing.lg,
                      AppSpacing.huge,
                    ),
                    itemCount: faqs.length,
                    separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (context, index) {
                      final faq = faqs[index];
                      return FaqExpandableCard(faq: faq, key: ValueKey(faq.id));
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
