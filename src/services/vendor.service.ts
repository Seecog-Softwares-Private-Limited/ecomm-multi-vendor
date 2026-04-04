/**
 * Vendor service — typed API calls for vendor dashboard (products, etc.).
 * Use from UI; requires authenticated session (cookie).
 */

import { request, getBaseUrl } from "./client";
import { ServiceError } from "./errors";
import type {
  VendorProductListItem,
  CreateVendorProductPayload,
  CreateVendorProductResponse,
  VendorProductForEdit,
  UpdateVendorProductPayload,
  VendorOrderListItem,
  VendorEarningsResult,
  VendorEarningsParams,
  VendorPayoutsResult,
  VendorPayoutsParams,
  VendorReportsSummary,
  VendorOrdersParams,
  VendorProductsParams,
  VendorProfileData,
  UpdateVendorProfilePayload,
  VendorSupportTicketItem,
  SubmitSupportTicketPayload,
  VendorDashboardSummary,
  VendorMeResponse,
  VendorNotificationsResult,
} from "./types/vendor.types";

const VENDOR_BASE = "/api/vendor";

export const vendorService = {
  /** Current vendor session and status (for onboarding lock UI). */
  async getMe(): Promise<VendorMeResponse> {
    return request<VendorMeResponse>(`${VENDOR_BASE}/me`, { method: "GET" });
  },

  /** Get a single product for edit. */
  async getProduct(productId: string): Promise<VendorProductForEdit> {
    return request<VendorProductForEdit>(`${VENDOR_BASE}/products/${productId}`, {
      method: "GET",
    });
  },

  /** Create a new product. Returns created product (id, name, sku, status, createdAt). */
  async createProduct(
    payload: CreateVendorProductPayload
  ): Promise<CreateVendorProductResponse> {
    return request<CreateVendorProductResponse>(`${VENDOR_BASE}/products`, {
      method: "POST",
      body: payload,
    });
  },

  /** Update an existing product. */
  async updateProduct(
    productId: string,
    payload: UpdateVendorProductPayload
  ): Promise<VendorProductForEdit> {
    return request<VendorProductForEdit>(`${VENDOR_BASE}/products/${productId}`, {
      method: "PUT",
      body: payload,
    });
  },

  /** Soft-delete a product (vendor must own it). */
  async deleteProduct(productId: string): Promise<{ id: string; deleted: boolean }> {
    return request<{ id: string; deleted: boolean }>(
      `${VENDOR_BASE}/products/${productId}`,
      { method: "DELETE" }
    );
  },

  /** List orders for the logged-in vendor (optional date filter for reports). */
  async getOrders(params?: VendorOrdersParams): Promise<VendorOrderListItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    const qs = searchParams.toString();
    const url = qs ? `${VENDOR_BASE}/orders?${qs}` : `${VENDOR_BASE}/orders`;
    return request<VendorOrderListItem[]>(url, { method: "GET" });
  },

  /** List products for the logged-in vendor (optional date filter by updatedAt for reports). */
  async getProducts(params?: VendorProductsParams): Promise<VendorProductListItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    const qs = searchParams.toString();
    const url = qs ? `${VENDOR_BASE}/products?${qs}` : `${VENDOR_BASE}/products`;
    return request<VendorProductListItem[]>(url, { method: "GET" });
  },

  /** Get reports dashboard summary (orders this month, products listed, total earnings). */
  async getReportsSummary(): Promise<VendorReportsSummary> {
    return request<VendorReportsSummary>(`${VENDOR_BASE}/reports/summary`, {
      method: "GET",
    });
  },

  /** Get vendor profile (business, owner, bank, documents). */
  async getProfile(): Promise<VendorProfileData> {
    return request<VendorProfileData>(`${VENDOR_BASE}/profile`, { method: "GET" });
  },

  /** Update vendor profile; use status: "submitted" to submit for approval. */
  async updateProfile(payload: UpdateVendorProfilePayload): Promise<VendorProfileData> {
    return request<VendorProfileData>(`${VENDOR_BASE}/profile`, {
      method: "PUT",
      body: payload,
    });
  },

  /** Submit profile for approval. Backend validates all required fields; returns 400 if incomplete. */
  async submitForApproval(): Promise<{ message: string; profile: VendorProfileData }> {
    return request<{ message: string; profile: VendorProfileData }>(
      `${VENDOR_BASE}/submit-for-approval`,
      { method: "POST" }
    );
  },

  /** List categories (id, name, slug) for profile and product form. */
  async getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
    return request<{ id: string; name: string; slug: string }[]>(`${VENDOR_BASE}/categories`, { method: "GET" });
  },

  /** List subcategories for a category (for product form). */
  async getSubcategories(categoryId: string): Promise<{ id: string; slug: string; name: string }[]> {
    return request<{ id: string; slug: string; name: string }[]>(
      `${VENDOR_BASE}/subcategories?categoryId=${encodeURIComponent(categoryId)}`,
      { method: "GET" }
    );
  },

  /** Get document names for a category (optional/required – vendor may upload or skip). */
  async getCategoryDocumentRequirements(categoryId: string): Promise<{ documentName: string; isRequired: boolean }[]> {
    const res = await request<{ documentName: string; isRequired: boolean }[]>(
      `${VENDOR_BASE}/category-document-requirements?categoryId=${encodeURIComponent(categoryId)}`,
      { method: "GET" }
    );
    return Array.isArray(res) ? res : [];
  },

  /** Delete a vendor document by its ID. */
  async deleteVendorDocument(id: string): Promise<void> {
    await request(`${VENDOR_BASE}/profile/vendor-documents/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  /** Upload a category-specific vendor document. */
  async uploadVendorDocument(documentName: string, file: File): Promise<{ url: string; documentName: string }> {
    const formData = new FormData();
    formData.append("documentName", documentName);
    formData.append("file", file);
    const base = getBaseUrl();
    const url = base ? `${base}${VENDOR_BASE}/profile/vendor-documents` : `${VENDOR_BASE}/profile/vendor-documents`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const json = (await res.json()) as {
      success?: boolean;
      data?: { url: string; documentName: string };
      error?: { message: string };
    };
    if (!res.ok) {
      const msg = json?.error?.message ?? res.statusText ?? "Upload failed";
      throw new ServiceError(msg, "UPLOAD_ERROR", res.status);
    }
    if (!json.success || !json.data) {
      throw new ServiceError("Invalid upload response", "UPLOAD_ERROR");
    }
    return json.data;
  },

  /** Upload a KYC document (PAN, GST_CERTIFICATE, or ADDRESS_PROOF). */
  async uploadKycDocument(
    documentType: "PAN" | "GST_CERTIFICATE" | "ADDRESS_PROOF",
    file: File
  ): Promise<{ url: string; documentType: string }> {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);
    const base = getBaseUrl();
    const url = base ? `${base}${VENDOR_BASE}/profile/documents` : `${VENDOR_BASE}/profile/documents`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const json = (await res.json()) as {
      success?: boolean;
      data?: { url: string; documentType: string };
      error?: { message: string };
    };
    if (!res.ok) {
      const msg = json?.error?.message ?? res.statusText ?? "Upload failed";
      throw new ServiceError(msg, "UPLOAD_ERROR", res.status);
    }
    if (!json.success || !json.data) {
      throw new ServiceError("Invalid upload response", "UPLOAD_ERROR");
    }
    return json.data;
  },

  /** Get payouts (summary + list + bank account) with optional date filter. */
  async getPayouts(params?: VendorPayoutsParams): Promise<VendorPayoutsResult> {
    const searchParams = new URLSearchParams();
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    const qs = searchParams.toString();
    const url = qs ? `${VENDOR_BASE}/payouts?${qs}` : `${VENDOR_BASE}/payouts`;
    return request<VendorPayoutsResult>(url, { method: "GET" });
  },

  /** Get earnings (summary + breakdown) with optional filters. */
  async getEarnings(params?: VendorEarningsParams): Promise<VendorEarningsResult> {
    const searchParams = new URLSearchParams();
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    if (params?.orderId) searchParams.set("orderId", params.orderId);
    if (params?.payoutStatus) searchParams.set("payoutStatus", params.payoutStatus);
    const qs = searchParams.toString();
    const url = qs ? `${VENDOR_BASE}/earnings?${qs}` : `${VENDOR_BASE}/earnings`;
    return request<VendorEarningsResult>(url, { method: "GET" });
  },

  /** Get dashboard summary (KPIs, recent orders, low stock). */
  async getDashboard(): Promise<VendorDashboardSummary> {
    return request<VendorDashboardSummary>(`${VENDOR_BASE}/dashboard`, {
      method: "GET",
    });
  },

  /** List support tickets for the logged-in vendor. */
  async getSupportTickets(): Promise<VendorSupportTicketItem[]> {
    return request<VendorSupportTicketItem[]>(`${VENDOR_BASE}/support/tickets`, {
      method: "GET",
    });
  },

  /** Submit a new support ticket. */
  async submitSupportTicket(
    payload: SubmitSupportTicketPayload
  ): Promise<VendorSupportTicketItem> {
    return request<VendorSupportTicketItem>(`${VENDOR_BASE}/support/tickets`, {
      method: "POST",
      body: payload,
    });
  },

  /** List notifications for the logged-in vendor. */
  async getNotifications(opts?: { limit?: number; unreadOnly?: boolean }): Promise<VendorNotificationsResult> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.unreadOnly) params.set("unread", "true");
    const qs = params.toString();
    return request<VendorNotificationsResult>(
      qs ? `${VENDOR_BASE}/notifications?${qs}` : `${VENDOR_BASE}/notifications`,
      { method: "GET" }
    );
  },

  /** Mark a single notification as read. */
  async markNotificationRead(id: string): Promise<{ id: string; read: boolean }> {
    return request(`${VENDOR_BASE}/notifications/${encodeURIComponent(id)}`, { method: "PATCH" });
  },

  /** Mark all notifications as read. Returns count of updated rows. */
  async markAllNotificationsRead(): Promise<{ updated: number }> {
    return request(`${VENDOR_BASE}/notifications`, { method: "PATCH" });
  },

  /** Send OTP to the vendor's saved phone number for verification. */
  async sendPhoneOtp(): Promise<{ message: string; expiresInSeconds: number; smsSent: boolean; devOtp?: string }> {
    return request(`${VENDOR_BASE}/verify/phone/send`, { method: "POST" });
  },

  /** Confirm phone OTP. Returns { verified: true } on success. */
  async confirmPhoneOtp(code: string): Promise<{ verified: boolean; message: string }> {
    return request(`${VENDOR_BASE}/verify/phone/confirm`, { method: "POST", body: { code } });
  },

  /** Send OTP to the vendor's saved email address for verification. */
  async sendEmailOtp(): Promise<{ message: string; expiresInSeconds: number; emailSent: boolean; devOtp?: string }> {
    return request(`${VENDOR_BASE}/verify/email/send`, { method: "POST" });
  },

  /** Confirm email OTP. Returns { verified: true } on success. */
  async confirmEmailOtp(code: string): Promise<{ verified: boolean; message: string }> {
    return request(`${VENDOR_BASE}/verify/email/confirm`, { method: "POST", body: { code } });
  },

  /** Upload a product image. Returns the public URL to use in imageUrls. */
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const base = getBaseUrl();
    const url = base ? `${base}${VENDOR_BASE}/upload` : `${VENDOR_BASE}/upload`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const json = (await res.json()) as { success?: boolean; data?: { url: string }; error?: { message: string } };
    if (!res.ok) {
      const msg = json?.error?.message ?? res.statusText ?? "Upload failed";
      throw new ServiceError(msg, "UPLOAD_ERROR", res.status);
    }
    if (!json.success || !json.data?.url) {
      throw new ServiceError("Invalid upload response", "UPLOAD_ERROR");
    }
    return json.data;
  },
};
