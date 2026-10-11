import { emailConfig } from "./config";
import { sendMail } from "./send";

export type VendorNewOrderLine = {
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantLabel: string | null;
};

export type VendorNewOrderEmailParams = {
  to: string;
  vendorName: string;
  orderId: string;
  orderShortId: string;
  paymentMode: string;
  orderStatus: string;
  customerName: string;
  customerPhone: string;
  shippingLines: string[];
  lines: VendorNewOrderLine[];
  sellerSubtotal: number;
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Email a vendor about a new order that includes their products.
 * Does not throw; returns { sent, error }.
 */
export async function sendVendorNewOrderEmail(
  params: VendorNewOrderEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const orderUrl = `${emailConfig.appUrl}/vendor/orders/${encodeURIComponent(params.orderId)}`;
  const subject = `New order #${params.orderShortId} — ${params.lines.length} item(s)`;

  const itemTextLines = params.lines.map((l, i) => {
    const variant = l.variantLabel ? ` (${l.variantLabel})` : "";
    const sku = l.sku ? ` · SKU ${l.sku}` : "";
    return `${i + 1}. ${l.productName}${variant}${sku}\n   Qty ${l.quantity} × ${formatInr(l.unitPrice)} = ${formatInr(l.totalPrice)}`;
  });

  const text = [
    `Hi ${params.vendorName},`,
    "",
    `You have a new order #${params.orderShortId}.`,
    `Status: ${params.orderStatus}`,
    `Payment: ${params.paymentMode}`,
    "",
    "Items for you:",
    ...itemTextLines,
    "",
    `Your items subtotal: ${formatInr(params.sellerSubtotal)}`,
    "",
    "Ship to:",
    params.customerName,
    params.customerPhone,
    ...params.shippingLines,
    "",
    `Open order: ${orderUrl}`,
    "",
    "— IndoVyapar",
  ].join("\n");

  const itemRowsHtml = params.lines
    .map((l) => {
      const variant = l.variantLabel
        ? `<br/><span style="color:#6B7280;font-size:13px">${escapeHtml(l.variantLabel)}</span>`
        : "";
      const sku = l.sku
        ? `<br/><span style="color:#6B7280;font-size:12px">SKU ${escapeHtml(l.sku)}</span>`
        : "";
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;vertical-align:top">
          <strong>${escapeHtml(l.productName)}</strong>${variant}${sku}
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;text-align:center">${l.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;text-align:right">${formatInr(l.unitPrice)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #E5E7EB;text-align:right">${formatInr(l.totalPrice)}</td>
      </tr>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827">
      <h2 style="margin:0 0 8px;font-size:20px">New order #${escapeHtml(params.orderShortId)}</h2>
      <p style="margin:0 0 16px;color:#4B5563">Hi ${escapeHtml(params.vendorName)}, you have new items to fulfil.</p>
      <p style="margin:0 0 4px"><strong>Status:</strong> ${escapeHtml(params.orderStatus)}</p>
      <p style="margin:0 0 16px"><strong>Payment:</strong> ${escapeHtml(params.paymentMode)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
        <thead>
          <tr style="background:#F9FAFB">
            <th style="padding:10px 8px;text-align:left;border-bottom:1px solid #E5E7EB">Product</th>
            <th style="padding:10px 8px;text-align:center;border-bottom:1px solid #E5E7EB">Qty</th>
            <th style="padding:10px 8px;text-align:right;border-bottom:1px solid #E5E7EB">Unit</th>
            <th style="padding:10px 8px;text-align:right;border-bottom:1px solid #E5E7EB">Total</th>
          </tr>
        </thead>
        <tbody>${itemRowsHtml}</tbody>
      </table>
      <p style="margin:0 0 16px"><strong>Your items subtotal:</strong> ${formatInr(params.sellerSubtotal)}</p>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px 14px;margin-bottom:20px">
        <p style="margin:0 0 6px;font-weight:700">Ship to</p>
        <p style="margin:0">${escapeHtml(params.customerName)}</p>
        <p style="margin:4px 0 0">${escapeHtml(params.customerPhone)}</p>
        ${params.shippingLines.map((l) => `<p style="margin:4px 0 0">${escapeHtml(l)}</p>`).join("")}
      </div>
      <p style="margin:0 0 24px">
        <a href="${orderUrl}" style="display:inline-block;background:#FF6A00;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700">
          View order
        </a>
      </p>
      <p style="margin:0;color:#9CA3AF;font-size:12px">IndoVyapar</p>
    </div>
  `;

  return sendMail({ to: params.to, subject, text, html });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
