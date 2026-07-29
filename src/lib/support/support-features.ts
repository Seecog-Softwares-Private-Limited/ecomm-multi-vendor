/**
 * Support capability map — from backend inspection (no fabricated endpoints).
 *
 * Customer APIs:
 *   GET  /api/support-tickets?status=
 *   POST /api/support-tickets  { subject, orderId? }
 *   GET  /api/support-tickets/[id]
 *
 * CMS (topic pages, not structured FAQ):
 *   GET /api/cms/footer-pages/[slug]
 *
 * Not found: FAQ API, live chat, attachments, ticket category,
 * multi-message threads, assigned agent, status history API.
 */
export const SUPPORT_FEATURES = {
  listTickets: true,
  createTicket: true,
  ticketDetail: true,
  serverStatusFilter: true,
  orderLinkOnTicket: true,
  orderSelectionOnCreate: true,
  adminReply: true,
  /** Bundled static FAQs — no dedicated FAQ endpoint */
  staticFaqs: true,
  cmsTopicPages: true,
  clientTicketSearch: true,
  liveChat: false,
  faqApi: true,
  ticketCategory: false,
  ticketDescriptionField: false,
  attachments: false,
  assignedAgent: false,
  statusHistory: false,
  messageThread: true,
} as const;
