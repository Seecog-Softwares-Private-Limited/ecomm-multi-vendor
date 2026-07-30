import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/support_helpers.dart';
import '../support_controller.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/support_empty_state.dart';
import '../widgets/support_skeletons.dart';
import '../widgets/support_status_badge.dart';

class TicketDetailPage extends ConsumerStatefulWidget {
  const TicketDetailPage({required this.ticketId, super.key});

  final String ticketId;

  @override
  ConsumerState<TicketDetailPage> createState() => _TicketDetailPageState();
}

class _TicketDetailPageState extends ConsumerState<TicketDetailPage> {
  final _message = TextEditingController();
  final _scrollController = ScrollController();
  bool _sending = false;
  static const _maxLen = 5000;

  @override
  void dispose() {
    _message.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToLatest() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
      );
    });
  }

  Future<void> _send(String status) async {
    final text = _message.text.trim();
    if (text.isEmpty || _sending) return;
    if (!supportTicketAllowsReply(status)) {
      context.showSnack('This ticket is closed and cannot accept replies.', isError: true);
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() => _sending = true);
    final draft = text;
    _message.clear();
    try {
      await ref.read(ticketMessagesControllerProvider(widget.ticketId).notifier).reply(draft);
      _scrollToLatest();
    } catch (error) {
      _message.text = draft;
      if (mounted) {
        context.showSnack(Failure.from(error).message, isError: true);
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ticketAsync = ref.watch(supportTicketDetailProvider(widget.ticketId));
    final messagesAsync = ref.watch(ticketMessagesControllerProvider(widget.ticketId));
    final adaptive = context.adaptiveColors;

    ref.listen(ticketMessagesControllerProvider(widget.ticketId), (prev, next) {
      next.whenData((_) => _scrollToLatest());
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(
          ticketAsync.value?.shortId.isNotEmpty == true
              ? ticketAsync.value!.shortId
              : 'Ticket',
        ),
      ),
      body: ticketAsync.when(
        loading: () => const TicketDetailSkeleton(),
        error: (error, _) => ErrorStateView(
          message: 'Could not load this ticket.',
          onRetry: () {
            ref.invalidate(supportTicketDetailProvider(widget.ticketId));
            ref.invalidate(ticketMessagesControllerProvider(widget.ticketId));
          },
        ),
        data: (ticket) {
          final canReply = supportTicketAllowsReply(ticket.status);
          final orderLabel = shortOrderLabel(ticket.orderId);
          return Column(
            children: [
              Material(
                color: adaptive.surface,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.sm,
                    AppSpacing.lg,
                    AppSpacing.md,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              ticket.subject,
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                          ),
                          SupportStatusBadge(status: ticket.status),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.md,
                        runSpacing: AppSpacing.xs,
                        children: [
                          Text(
                            'Created ${Formatters.dayMonthYear(ticket.createdAt)}',
                            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                  color: adaptive.textSecondary,
                                ),
                          ),
                          if (orderLabel.isNotEmpty)
                            InkWell(
                              onTap: ticket.orderId == null
                                  ? null
                                  : () => context.push(AppRoutes.orderPath(ticket.orderId!)),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.receipt_long_outlined, size: 14, color: AppColors.primary),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Order $orderLabel',
                                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.w700,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: messagesAsync.when(
                  loading: () => const TicketDetailSkeleton(),
                  error: (error, _) => ErrorStateView(
                    message: 'Could not load messages.',
                    onRetry: () => ref
                        .read(ticketMessagesControllerProvider(widget.ticketId).notifier)
                        .refresh(),
                  ),
                  data: (messages) {
                    if (messages.isEmpty) {
                      return const SupportEmptyState(kind: SupportEmptyKind.messages);
                    }
                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final message = messages[index];
                        return ChatBubble(message: message, key: ValueKey(message.id));
                      },
                    );
                  },
                ),
              ),
              SafeArea(
                top: false,
                child: Material(
                  color: adaptive.surface,
                  elevation: 6,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md,
                      AppSpacing.sm,
                      AppSpacing.md,
                      AppSpacing.sm,
                    ),
                    child: canReply
                        ? Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Expanded(
                                    child: Semantics(
                                      textField: true,
                                      label: 'Reply message',
                                      child: TextField(
                                        controller: _message,
                                        minLines: 1,
                                        maxLines: 5,
                                        maxLength: _maxLen,
                                        enabled: !_sending,
                                        textInputAction: TextInputAction.newline,
                                        onChanged: (_) => setState(() {}),
                                        decoration: const InputDecoration(
                                          hintText: 'Type your reply…',
                                          counterText: '',
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  SizedBox(
                                    width: 48,
                                    height: 48,
                                    child: IconButton.filled(
                                      tooltip: 'Send reply',
                                      onPressed: _sending || _message.text.trim().isEmpty
                                          ? null
                                          : () => _send(ticket.status),
                                      icon: _sending
                                          ? const SizedBox(
                                              width: 18,
                                              height: 18,
                                              child: CircularProgressIndicator(strokeWidth: 2),
                                            )
                                          : const Icon(Icons.send_rounded),
                                    ),
                                  ),
                                ],
                              ),
                              Align(
                                alignment: Alignment.centerRight,
                                child: Text(
                                  '${_message.text.length}/$_maxLen',
                                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                        color: adaptive.textMuted,
                                      ),
                                ),
                              ),
                            ],
                          )
                        : Padding(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            child: Text(
                              'This ticket is closed. Create a new ticket if you still need help.',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: adaptive.textSecondary,
                                  ),
                            ),
                          ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
