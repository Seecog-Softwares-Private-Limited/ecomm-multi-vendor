"use client";

import { HelpCircle, Send, Mail, Ticket } from "lucide-react";
import { Button, Input, Textarea, Card, Alert } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import { useSearchParams } from "next/navigation";
import * as React from "react";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General Inquiry",
  orders: "Orders & Fulfillment",
  products: "Product Listings",
  payments: "Payments & Payouts",
  technical: "Technical Issue",
  account: "Account & KYC",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

function normalizeCategory(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

function displayCategory(raw: string): string {
  const normalized = normalizeCategory(raw);
  return (
    CATEGORY_LABELS[normalized] ??
    raw
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function VendorSupport() {
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get("orderId")?.trim() ?? "";
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [category, setCategory] = React.useState("general");
  const [saving, setSaving] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const prefillsApplied = React.useRef(false);

  React.useEffect(() => {
    if (!orderIdFromQuery || prefillsApplied.current) return;
    setSubject(`Order ${orderIdFromQuery}`);
    setCategory("orders");
    setMessage(`Regarding order ${orderIdFromQuery}:\n\n`);
    prefillsApplied.current = true;
  }, [orderIdFromQuery]);

  const { data: tickets, error, isLoading, refetch } = useApi(() =>
    vendorService.getSupportTickets()
  );

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setErrorMessage("Please fill in subject and message.");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);
    try {
      await vendorService.submitSupportTicket({
        subject: subject.trim(),
        category: category.trim(),
        message: message.trim(),
      });
      setSuccessMessage(
        "Support ticket submitted successfully. We'll get back to you within 24 hours on business days."
      );
      setSubject("");
      setMessage("");
      setCategory("general");
      refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit ticket.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const faqs = [
    {
      question: "How do I add a new product?",
      answer:
        "Go to Products → Add Product. Fill in all details and submit for approval. Products must be approved by admin before going live.",
    },
    {
      question: "When will I receive my payout?",
      answer:
        "Payouts are processed weekly (every Friday) for orders delivered in the previous week. Funds are transferred within 2-3 business days.",
    },
    {
      question: "How do I update my bank account?",
      answer:
        "Visit Profile & KYC → Bank Details. Update your information and submit. Bank changes require admin approval.",
    },
    {
      question: "What is the commission structure?",
      answer:
        "Commission varies by category, typically 10-15%. You can see the exact commission for each order in the Earnings section.",
    },
    {
      question: "How do I handle returns or order issues?",
      answer:
        "Open the order detail page and tap Contact Support. That opens this form with the order ID filled in so our team can help.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold leading-snug text-[#1E293B] sm:text-2xl lg:text-3xl mb-2">
          Support & Help
        </h1>
        <p className="text-[#64748B]">Get help with your vendor account</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Mail className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Email Support</h3>
              <p className="text-sm text-[#64748B]">
                Prefer email? Write to us and include your vendor email and order ID if relevant.
              </p>
              <a
                href="mailto:vendor-support@indovyapar.com"
                className="mt-1 inline-block text-sm font-semibold text-[#3B82F6] hover:underline"
              >
                vendor-support@indovyapar.com
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Submit a Support Ticket">
        <div className="space-y-6">
          {successMessage && <Alert type="success" message={successMessage} />}
          {errorMessage && <Alert type="error" message={errorMessage} />}
          <Alert
            type="info"
            message="Our support team typically responds within 24 hours on business days. Use the ticket form below for the fastest response."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#1E293B]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border-2 border-[#E2E8F0] bg-white px-4 py-3 text-[#1E293B] transition-all focus:border-[#3B82F6] focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Message"
            placeholder="Describe your issue in detail..."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => void handleSubmit()} disabled={saving}>
              <Send className="h-5 w-5" />
              {saving ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="My Support Tickets">
        <DataState isLoading={isLoading} error={error} retry={refetch}>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#1E293B]">{t.subject}</p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {displayCategory(t.category)} · {STATUS_LABELS[t.status] ?? t.status}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#64748B]">{t.message}</p>
                    {t.adminReply ? (
                      <div className="mt-3 border-t border-[#E2E8F0] pt-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#16A34A]">
                          Support reply
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-[#1E293B]">{t.adminReply}</p>
                        {t.adminRepliedAt ? (
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            {new Date(t.adminRepliedAt).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <p className="mt-2 text-xs text-[#94A3B8]">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-[#64748B]">You haven&apos;t submitted any tickets yet.</p>
          )}
        </DataState>
      </Card>

      <div id="faqs">
        <Card title="Frequently Asked Questions">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-6 transition-colors hover:border-[#3B82F6]"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-[#3B82F6]" />
                  <div>
                    <h4 className="mb-2 font-semibold text-[#1E293B]">{faq.question}</h4>
                    <p className="text-sm text-[#64748B]">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Additional Resources">
        <a
          href="/vendor/guidelines"
          className="flex items-center gap-3 rounded-xl border-2 border-transparent bg-[#F8FAFC] p-4 transition-colors hover:border-[#3B82F6] hover:bg-[#F1F5F9]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <HelpCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-[#1E293B]">Vendor Guidelines</p>
            <p className="text-sm text-[#64748B]">Read our complete vendor manual</p>
          </div>
        </a>
      </Card>
    </div>
  );
}
