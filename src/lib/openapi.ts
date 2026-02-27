/**
 * OpenAPI 3.0 specification for Indovypar / MarketHub API.
 * Served at /api/openapi and used by Swagger UI at /api-docs.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Indovypar API",
    description: "E-commerce multi-vendor platform API. Vendor endpoints require session cookie (login via POST /api/auth/vendor-login first).",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:3000", description: "Local" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Catalog" },
    { name: "Vendor" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Customer register",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Success, sets cookie" }, "400": { description: "Validation error" }, "409": { description: "Email exists" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Customer login",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Success, sets cookie" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/api/auth/vendor-register": {
      post: {
        tags: ["Auth"],
        summary: "Vendor register",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "businessName", "ownerName"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  businessName: { type: "string" },
                  ownerName: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Success, sets cookie" }, "409": { description: "Email exists" } },
      },
    },
    "/api/auth/admin-login": {
      post: {
        tags: ["Auth"],
        summary: "Admin login",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Success, sets cookie" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/api/auth/vendor-login": {
      post: {
        tags: ["Auth"],
        summary: "Vendor login",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Success, sets cookie" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        responses: { "200": { description: "User" }, "401": { description: "Not authenticated" } },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        responses: { "200": { description: "Cookie cleared" } },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Catalog"],
        summary: "List categories",
        responses: { "200": { description: "Categories list" } },
      },
    },
    "/api/products": {
      get: {
        tags: ["Catalog"],
        summary: "List products",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "subCategory", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Products list" } },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Catalog"],
        summary: "Get product by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product" }, "404": { description: "Not found" } },
      },
    },
    "/api/products/{id}/reviews": {
      get: {
        tags: ["Catalog"],
        summary: "Get product reviews",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Reviews" } },
      },
    },
    "/api/products/{id}/questions": {
      get: {
        tags: ["Catalog"],
        summary: "Get product Q&A",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Questions" } },
      },
    },
    "/api/vendor/me": {
      get: {
        tags: ["Vendor"],
        summary: "Vendor session check",
        responses: { "200": { description: "Vendor info" }, "401": { description: "Not vendor" } },
      },
    },
    "/api/vendor/dashboard": {
      get: {
        tags: ["Vendor"],
        summary: "Dashboard summary",
        responses: { "200": { description: "KPIs, recent orders, low stock" }, "401": { description: "Unauthorized" } },
      },
    },
    "/api/vendor/orders": {
      get: {
        tags: ["Vendor"],
        summary: "List orders",
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string", format: "date" } },
          { name: "dateTo", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: { "200": { description: "Orders" } },
      },
    },
    "/api/vendor/products": {
      get: {
        tags: ["Vendor"],
        summary: "List vendor products",
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Products" } },
      },
      post: {
        tags: ["Vendor"],
        summary: "Create product",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "categorySlug", "subCategorySlug", "sku", "mrp", "sellingPrice", "stock"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  categorySlug: { type: "string" },
                  subCategorySlug: { type: "string" },
                  sku: { type: "string" },
                  mrp: { type: "number" },
                  sellingPrice: { type: "number" },
                  gstPercent: { type: "number" },
                  stock: { type: "integer" },
                  returnPolicy: { type: "string", enum: ["no-return", "7days", "10days", "15days"] },
                  status: { type: "string", enum: ["DRAFT", "PENDING_APPROVAL"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Created product" }, "400": { description: "Validation error" } },
      },
    },
    "/api/vendor/products/{productId}": {
      get: {
        tags: ["Vendor"],
        summary: "Get product",
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product" } },
      },
      put: {
        tags: ["Vendor"],
        summary: "Update product",
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "Updated" } },
      },
      delete: {
        tags: ["Vendor"],
        summary: "Delete product",
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } },
      },
    },
    "/api/vendor/upload": {
      post: {
        tags: ["Vendor"],
        summary: "Upload product image",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { file: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { "200": { description: "Returns { url }" } },
      },
    },
    "/api/vendor/profile": {
      get: {
        tags: ["Vendor"],
        summary: "Get profile",
        responses: { "200": { description: "Profile" } },
      },
      put: {
        tags: ["Vendor"],
        summary: "Update profile",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  business: { type: "object" },
                  owner: { type: "object" },
                  bank: { type: "object" },
                  status: { type: "string", enum: ["draft", "submitted"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Updated profile" } },
      },
    },
    "/api/vendor/profile/documents": {
      post: {
        tags: ["Vendor"],
        summary: "Upload KYC document",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["documentType", "file"],
                properties: {
                  documentType: { type: "string", enum: ["PAN", "GST_CERTIFICATE", "ADDRESS_PROOF"] },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Returns { url, documentType }" } },
      },
    },
    "/api/vendor/earnings": {
      get: {
        tags: ["Vendor"],
        summary: "Get earnings",
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
          { name: "orderId", in: "query", schema: { type: "string" } },
          { name: "payoutStatus", in: "query", schema: { type: "string", enum: ["all", "paid", "unpaid"] } },
        ],
        responses: { "200": { description: "Earnings" } },
      },
    },
    "/api/vendor/payouts": {
      get: {
        tags: ["Vendor"],
        summary: "Get payouts",
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Payouts" } },
      },
    },
    "/api/vendor/reports/summary": {
      get: {
        tags: ["Vendor"],
        summary: "Reports summary",
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Summary" } },
      },
    },
    "/api/vendor/support/tickets": {
      get: {
        tags: ["Vendor"],
        summary: "List support tickets",
        responses: { "200": { description: "Tickets" } },
      },
      post: {
        tags: ["Vendor"],
        summary: "Create support ticket",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["subject", "category", "message"],
                properties: {
                  subject: { type: "string" },
                  category: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Created ticket" } },
      },
    },
  },
  components: {
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object", description: "Response payload" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object" },
            },
          },
        },
      },
    },
  },
} as const;
