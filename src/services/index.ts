/**
 * Service layer — use these from UI instead of calling APIs directly.
 *
 * - client: low-level request<T>(path, options); throws ServiceError
 * - errors: ServiceError class for centralized error handling
 * - authService: register, login, logout, getSession
 * - catalogService: getCategories, getProducts, getProductById, getProductReviews, getProductQuestions
 */

export { request, getBaseUrl } from "./client";
export type { RequestMethod, RequestOptions } from "./client";
export { ServiceError } from "./errors";
export { authService } from "./auth.service";
export { catalogService } from "./catalog.service";
export { vendorService } from "./vendor.service";

export type {
  AuthUser,
  RegisterPayload,
  LoginPayload,
  AuthSessionResponse,
  VendorLoginPayload,
  VendorSessionResponse,
} from "./types/auth.types";
export type {
  CategoryItem,
  ProductListItem,
  ProductDetail,
  ReviewItem,
  ProductQuestionItem,
  GetProductsParams,
} from "./types/catalog.types";
export type {
  VendorProductListItem,
  VendorProductStatus,
  CreateVendorProductPayload,
  CreateVendorProductResponse,
} from "./types/vendor.types";
