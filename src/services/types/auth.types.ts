/**
 * Auth service request/response types.
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
}

/** Payload for vendor (seller) login — same shape as LoginPayload. */
export interface VendorLoginPayload {
  email: string;
  password: string;
}

/** Payload for vendor (seller) registration. */
export interface VendorRegisterPayload {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  phone?: string;
}

export interface VendorSessionResponse {
  vendor: {
    id: string;
    email: string;
    businessName: string;
    ownerName: string;
    status: string;
    role: string;
  };
}
