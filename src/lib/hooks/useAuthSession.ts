"use client";

import { useApi } from "./useApi";
import { authService } from "@/services/auth.service";
import type { AuthSessionResponse } from "@/services/types/auth.types";

/**
 * Fetches current auth session via auth service (no direct API URL in UI).
 * Use in layout/header to show login state or user menu.
 */
export function useAuthSession() {
  return useApi<AuthSessionResponse | null>(async () => {
    return authService.getSession();
  });
}
