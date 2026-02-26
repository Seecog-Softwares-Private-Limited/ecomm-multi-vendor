/**
 * Auth service — typed API calls for authentication.
 * Use this from UI (e.g. login form, header) instead of calling fetch directly.
 */

import { request } from "./client";
import type {
  AuthSessionResponse,
  RegisterPayload,
  LoginPayload,
  VendorLoginPayload,
  VendorRegisterPayload,
  VendorSessionResponse,
} from "./types/auth.types";

const AUTH_BASE = "/api/auth";

export const authService = {
  /** Register a new user. Sets HTTP-only cookie on success. */
  async register(payload: RegisterPayload): Promise<AuthSessionResponse> {
    return request<AuthSessionResponse>(`${AUTH_BASE}/register`, {
      method: "POST",
      body: payload,
    });
  },

  /** Log in (customer). Sets HTTP-only cookie on success. */
  async login(payload: LoginPayload): Promise<AuthSessionResponse> {
    return request<AuthSessionResponse>(`${AUTH_BASE}/login`, {
      method: "POST",
      body: payload,
    });
  },

  /** Log in as vendor (Seller table). Sets HTTP-only cookie; JWT sub = seller.id. */
  async vendorLogin(payload: VendorLoginPayload): Promise<VendorSessionResponse> {
    return request<VendorSessionResponse>(`${AUTH_BASE}/vendor-login`, {
      method: "POST",
      body: payload,
    });
  },

  /** Register a new vendor (Seller). Creates account with status DRAFT and sets cookie. */
  async vendorRegister(payload: VendorRegisterPayload): Promise<VendorSessionResponse> {
    return request<VendorSessionResponse>(`${AUTH_BASE}/vendor-register`, {
      method: "POST",
      body: payload,
    });
  },

  /** Log out. Clears auth cookie. */
  async logout(): Promise<void> {
    await request<unknown>(`${AUTH_BASE}/logout`, { method: "POST" });
  },

  /** Get current session (user from cookie). Returns null if not authenticated. */
  async getSession(): Promise<AuthSessionResponse | null> {
    try {
      return await request<AuthSessionResponse>(`${AUTH_BASE}/me`, { method: "GET" });
    } catch {
      return null;
    }
  },
};
