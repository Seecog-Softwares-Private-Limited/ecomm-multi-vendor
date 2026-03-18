// Use same-origin proxy by default so the Super Admin backend can run on another port without CORS
const BASE =
  typeof window !== "undefined"
    ? "/api/superadmin"
    : process.env.SUPER_ADMIN_API_URL || process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("superadmin_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("superadmin_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("superadmin_token");
  localStorage.removeItem("superadmin_user");
}

export function setUser(user: object) {
  if (typeof window === "undefined") return;
  localStorage.setItem("superadmin_user", JSON.stringify(user));
}

export function getUser(): { id: string; name: string; email: string; role?: object; isSuperAdmin?: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("superadmin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

type Req = { method?: string; body?: object; headers?: Record<string, string> };

async function request<T>(path: string, options: Req = {}): Promise<{ success: boolean; data?: T; message?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: json.message || "Request failed" };
  }
  return json as { success: true; data: T };
}

export const superadminApi = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; admin: object }>("/auth/login", { method: "POST", body: { email, password } }),
  },
  admins: {
    list: (params?: { page?: number; limit?: number; search?: string; status?: string; approvalStatus?: string; roleId?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.search) q.set("search", params.search);
      if (params?.status) q.set("status", params.status);
      if (params?.approvalStatus) q.set("approvalStatus", params.approvalStatus);
      if (params?.roleId) q.set("roleId", params.roleId);
      return request<{ admins: Admin[]; pagination: Pagination }>(`/admins?${q.toString()}`);
    },
    create: (body: { name: string; email: string; password: string; roleId: string; status?: string; approvalStatus?: string }) =>
      request<{ admin: Admin }>("/admins", { method: "POST", body }),
    update: (id: string, body: { name?: string; email?: string; roleId?: string; status?: string; approvalStatus?: string }) =>
      request<{ admin: Admin }>(`/admins/${id}`, { method: "PUT", body }),
    delete: (id: string) => request<{ deleted: boolean }>(`/admins/${id}`, { method: "DELETE" }),
    updateStatus: (id: string, status: string) =>
      request<{ admin: { id: string; status: string } }>(`/admins/${id}/status`, { method: "PUT", body: { status } }),
    approve: (id: string, action: "approve" | "reject") =>
      request<{ admin: { id: string; approvalStatus: string; status: string } }>(`/admins/${id}/approve`, {
        method: "PUT",
        body: { action },
      }),
  },
  roles: {
    list: () => request<{ roles: Role[]; permissions: string[] }>("/roles"),
    create: (body: { name: string; permissions: string[]; description?: string }) =>
      request<{ role: Role }>("/roles", { method: "POST", body }),
    update: (id: string, body: { name?: string; permissions?: string[]; description?: string }) =>
      request<{ role: Role }>(`/roles/${id}`, { method: "PUT", body }),
  },
  auditLogs: {
    list: (params?: { page?: number; limit?: number; adminId?: string; module?: string; action?: string; startDate?: string; endDate?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.adminId) q.set("adminId", params.adminId);
      if (params?.module) q.set("module", params.module);
      if (params?.action) q.set("action", params.action);
      if (params?.startDate) q.set("startDate", params.startDate);
      if (params?.endDate) q.set("endDate", params.endDate);
      return request<{ logs: AuditLog[]; pagination: Pagination }>(`/audit-logs?${q.toString()}`);
    },
  },
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: { _id?: string; id?: string; name: string; permissions?: string[] };
  status: string;
  approvalStatus: string;
  isSuperAdmin?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
};

export type Role = {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
};

export type AuditLog = {
  id: string;
  adminId: string;
  adminName?: string;
  adminEmail?: string;
  action: string;
  module: string;
  metadata?: object;
  createdAt: string;
  ip?: string;
};

export type Pagination = { page: number; limit: number; total: number; totalPages: number };

export const PERMISSION_LABELS: Record<string, string> = {
  seller_management: "Seller Management (approve/reject sellers)",
  catalog: "Catalog (categories, products, attributes)",
  orders: "Orders (view/update)",
  finance: "Finance (refunds, settlements)",
  marketing: "Marketing (coupons, banners)",
  support: "Support (tickets, disputes)",
  settings: "Settings",
};
