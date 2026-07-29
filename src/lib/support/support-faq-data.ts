/** Static FAQ content — no FAQ API exists; categories power Help Center filters. */

export type FaqCategoryId =
  | "general"
  | "orders"
  | "returns"
  | "payments"
  | "account";

export type FaqItem = {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: string;
};

export const FAQ_CATEGORIES: { id: FaqCategoryId; label: string; emoji: string }[] = [
  { id: "general", label: "General", emoji: "💬" },
  { id: "orders", label: "Order Issues", emoji: "📦" },
  { id: "returns", label: "Returns & Refunds", emoji: "↩️" },
  { id: "payments", label: "Payments", emoji: "💳" },
  { id: "account", label: "Account & Security", emoji: "🔒" },
];

export const SUPPORT_FAQS: FaqItem[] = [
  {
    id: "track-order",
    category: "orders",
    question: "How do I track my order?",
    answer:
      "Go to My Orders from your profile, select an order, and tap Track Order. You'll see the latest status and estimated delivery timeline.",
  },
  {
    id: "order-delayed",
    category: "orders",
    question: "My order is delayed. What should I do?",
    answer:
      "Delivery times can vary by seller and location. Check the order tracking page first. If the status hasn't updated for several days, raise a support ticket with your order ID linked.",
  },
  {
    id: "cancel-order",
    category: "orders",
    question: "Can I cancel my order?",
    answer:
      "Orders can often be cancelled before they are shipped. Open the order detail page — if cancellation is available, you'll see a Cancel option. After shipping, you may need to request a return instead.",
  },
  {
    id: "return-item",
    category: "returns",
    question: "How do I return an item?",
    answer:
      "Visit Returns & Refunds in our help topics for the full policy. For delivered orders, open My Orders, select the item, and follow the return instructions shown on the order detail page.",
  },
  {
    id: "refund-time",
    category: "returns",
    question: "When will I receive my refund?",
    answer:
      "Refunds are typically processed within 5–7 business days after the returned item is received and inspected. The amount is credited to your original payment method.",
  },
  {
    id: "payment-failed",
    category: "payments",
    question: "My payment failed. Was I charged?",
    answer:
      "If payment failed at checkout, the order is not placed and you should not be charged. Any temporary bank hold usually reverses within 24–48 hours. Try again or use a different payment method.",
  },
  {
    id: "payment-methods",
    category: "payments",
    question: "Which payment methods are accepted?",
    answer:
      "We support UPI, credit/debit cards, net banking, and wallets through our secure payment partner. Available options are shown at checkout.",
  },
  {
    id: "reset-password",
    category: "account",
    question: "How do I reset my password?",
    answer:
      "On the login page, tap Forgot Password and enter your registered email. Follow the link in the email to set a new password.",
  },
  {
    id: "account-security",
    category: "account",
    question: "How do I keep my account secure?",
    answer:
      "Use a strong unique password, never share OTP codes, and log out on shared devices. Update your profile phone and email so we can reach you about orders.",
  },
  {
    id: "contact-support",
    category: "general",
    question: "How do I contact customer support?",
    answer:
      "Open Contact Support from the Help Center to raise a ticket. Include a clear subject and link your order if the issue is order-related. We respond via your ticket.",
  },
  {
    id: "delivery-areas",
    category: "general",
    question: "Do you deliver to my pincode?",
    answer:
      "Enter your pincode on the product page or at checkout to check delivery availability. Some products may not ship to all locations.",
  },
];

export function searchFaqs(
  faqs: FaqItem[],
  query: string,
  category: FaqCategoryId | "all"
): FaqItem[] {
  const q = query.trim().toLowerCase();
  return faqs.filter((f) => {
    if (category !== "all" && f.category !== category) return false;
    if (!q) return true;
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q)
    );
  });
}
