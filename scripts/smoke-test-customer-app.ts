#!/usr/bin/env tsx
/**
 * HTTP smoke tests for the IndoVyapar customer app APIs.
 * Requires: DATABASE_URL, JWT_SECRET, running Next.js server (or set SMOKE_BASE_URL).
 *
 * Run: npm run smoke:customer
 */
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { signToken } from "../src/lib/auth";

const BASE = (
  process.env.SMOKE_BASE_URL ??
  `http://localhost:${process.env.PORT ?? process.env.NEXT_PUBLIC_PORT ?? "3000"}`
).replace(/\/$/, "");
const TAG = `[customer-smoke:${Date.now()}]`;

type Result = { name: string; pass: boolean; detail?: string };
const results: Result[] = [];

function pass(name: string, detail?: string) {
  results.push({ name, pass: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, err: unknown) {
  const detail = err instanceof Error ? err.message : String(err);
  results.push({ name, pass: false, detail });
  console.error(`✗ ${name} — ${detail}`);
}

async function waitForServer(maxMs = 90_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Server not reachable at ${BASE}/api/health after ${maxMs}ms`);
}

type ApiJson = {
  success?: boolean;
  data?: unknown;
  error?: { message?: string };
};

async function api(
  path: string,
  opts: RequestInit & { cookie?: string; expectStatus?: number } = {}
): Promise<{ status: number; json: ApiJson }> {
  const headers = new Headers(opts.headers);
  if (opts.cookie) headers.set("Cookie", opts.cookie);
  if (opts.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    signal: AbortSignal.timeout(30_000),
  });

  const json = (await res.json().catch(() => ({}))) as ApiJson;
  if (opts.expectStatus != null) {
    assert.equal(res.status, opts.expectStatus, `${path} expected HTTP ${opts.expectStatus}, got ${res.status}: ${JSON.stringify(json)}`);
  }
  return { status: res.status, json };
}

async function loadCustomer() {
  const user = await prisma.user.findFirst({
    where: { deletedAt: null, email: { contains: "@" } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      addresses: { where: { deletedAt: null }, take: 1, select: { id: true } },
      orders: {
        where: { status: "DELIVERED" },
        take: 1,
        select: {
          id: true,
          items: { take: 1, select: { productId: true } },
        },
      },
    },
  });
  if (!user) throw new Error("No customer user in database. Run npm run seed.");
  return user;
}

async function loadProduct() {
  const product = await prisma.product.findFirst({
    where: { deletedAt: null, status: "ACTIVE" },
    select: { id: true, slug: true },
  });
  if (!product) throw new Error("No active product found.");
  return product;
}

async function main() {
  console.log(`\nCustomer app smoke tests ${TAG}`);
  console.log(`Base URL: ${BASE}\n`);

  await waitForServer();

  const customer = await loadCustomer();
  const product = await loadProduct();
  const token = await signToken({
    sub: customer.id,
    email: customer.email,
    role: "CUSTOMER",
  });
  const cookie = `auth_token=${token}`;

  // --- Public ---
  try {
    const { json } = await api("/api/health");
    assert.equal(json.success, true);
    pass("Public: GET /api/health");
  } catch (e) {
    fail("Public: GET /api/health", e);
  }

  try {
    const { json } = await api("/api/products?limit=5");
    assert.equal(json.success, true);
    pass("Public: GET /api/products");
  } catch (e) {
    fail("Public: GET /api/products", e);
  }

  try {
    const { json } = await api("/api/categories");
    assert.equal(json.success, true);
    pass("Public: GET /api/categories");
  } catch (e) {
    fail("Public: GET /api/categories", e);
  }

  try {
    const { json } = await api("/api/faqs");
    assert.equal(json.success, true);
    const faqs = (json.data as { faqs?: unknown[] })?.faqs;
    pass("Public: GET /api/faqs", Array.isArray(faqs) ? `${faqs.length} items` : "ok");
  } catch (e) {
    fail("Public: GET /api/faqs", e);
  }

  try {
    const { json } = await api(`/api/products/${product.id}/reviews?limit=10`);
    assert.equal(json.success, true);
    pass("Public: GET /api/products/:id/reviews");
  } catch (e) {
    fail("Public: GET /api/products/:id/reviews", e);
  }

  try {
    const { json } = await api(`/api/products/${product.id}/reviews/summary`);
    assert.equal(json.success, true);
    const summary = json.data as { reviewCount?: number; avgRating?: number };
    pass(
      "Public: GET /api/products/:id/reviews/summary",
      `count=${summary?.reviewCount ?? 0}`
    );
  } catch (e) {
    fail("Public: GET /api/products/:id/reviews/summary", e);
  }

  // --- Auth required (no cookie) ---
  try {
    const { status } = await api("/api/orders", { expectStatus: 401 });
    assert.ok(status === 401);
    pass("Auth guard: GET /api/orders without session → 401");
  } catch (e) {
    fail("Auth guard: GET /api/orders without session", e);
  }

  // --- Authenticated customer ---
  try {
    const { json } = await api("/api/auth/me", { cookie });
    assert.equal(json.success, true);
    pass("Customer: GET /api/auth/me");
  } catch (e) {
    fail("Customer: GET /api/auth/me", e);
  }

  try {
    const { json } = await api("/api/cart/items", { cookie });
    assert.equal(json.success, true);
    pass("Customer: GET /api/cart/items");
  } catch (e) {
    fail("Customer: GET /api/cart/items", e);
  }

  try {
    const { json } = await api("/api/wishlist", { cookie });
    assert.equal(json.success, true);
    const items = (json.data as { items?: unknown[] })?.items;
    pass("Customer: GET /api/wishlist", Array.isArray(items) ? `${items.length} items` : "ok");
  } catch (e) {
    fail("Customer: GET /api/wishlist", e);
  }

  try {
    const { json } = await api("/api/orders", { cookie });
    assert.equal(json.success, true);
    assert.ok(Array.isArray((json.data as { orders?: unknown[] })?.orders));
    pass("Customer: GET /api/orders (legacy shape)");
  } catch (e) {
    fail("Customer: GET /api/orders (legacy shape)", e);
  }

  try {
    const { json } = await api("/api/orders?page=1&limit=5&sort=newest", { cookie });
    assert.equal(json.success, true);
    const data = json.data as { orders?: unknown[]; pagination?: { total?: number } };
    assert.ok(Array.isArray(data.orders));
    assert.ok(data.pagination);
    pass("Customer: GET /api/orders (paginated)", `total=${data.pagination?.total ?? 0}`);
  } catch (e) {
    fail("Customer: GET /api/orders (paginated)", e);
  }

  try {
    const { json } = await api("/api/addresses", { cookie });
    assert.equal(json.success, true);
    pass("Customer: GET /api/addresses");
  } catch (e) {
    fail("Customer: GET /api/addresses", e);
  }

  let notificationId: string | null = null;
  try {
    const { json } = await api("/api/notifications?limit=20", { cookie });
    assert.equal(json.success, true);
    const data = json.data as { notifications?: { id: string }[]; unreadCount?: number };
    assert.ok(Array.isArray(data.notifications));
    assert.equal(typeof data.unreadCount, "number");
    notificationId = data.notifications[0]?.id ?? null;
    pass("Customer: GET /api/notifications", `unread=${data.unreadCount}`);
  } catch (e) {
    fail("Customer: GET /api/notifications", e);
  }

  try {
    const { json } = await api("/api/notifications/preferences", { cookie });
    assert.equal(json.success, true);
    pass("Customer: GET /api/notifications/preferences");
  } catch (e) {
    fail("Customer: GET /api/notifications/preferences", e);
  }

  try {
    const { json } = await api("/api/notifications/preferences", {
      method: "PATCH",
      cookie,
      body: JSON.stringify({ email: true, push: false }),
    });
    assert.equal(json.success, true);
    pass("Customer: PATCH /api/notifications/preferences");
  } catch (e) {
    fail("Customer: PATCH /api/notifications/preferences", e);
  }

  try {
    const { json } = await api("/api/notifications", { method: "PATCH", cookie });
    assert.equal(json.success, true);
    pass("Customer: PATCH /api/notifications (mark all read)");
  } catch (e) {
    fail("Customer: PATCH /api/notifications (mark all read)", e);
  }

  if (notificationId) {
    try {
      const { json } = await api(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        cookie,
      });
      assert.equal(json.success, true);
      pass("Customer: PATCH /api/notifications/:id");
    } catch (e) {
      fail("Customer: PATCH /api/notifications/:id", e);
    }
  } else {
    pass("Customer: PATCH /api/notifications/:id", "skipped — no notifications yet");
  }

  let ticketId: string | null = null;
  try {
    const { json } = await api("/api/support-tickets", { cookie });
    assert.equal(json.success, true);
    pass("Customer: GET /api/support-tickets");
  } catch (e) {
    fail("Customer: GET /api/support-tickets", e);
  }

  try {
    const { json } = await api("/api/support-tickets", {
      method: "POST",
      cookie,
      body: JSON.stringify({
        subject: `${TAG} smoke test ticket`,
        orderId: customer.orders[0]?.id ?? undefined,
      }),
    });
    assert.equal(json.success, true);
    ticketId = (json.data as { ticket?: { id: string } })?.ticket?.id ?? null;
    assert.ok(ticketId);
    pass("Customer: POST /api/support-tickets", ticketId);
  } catch (e) {
    fail("Customer: POST /api/support-tickets", e);
  }

  if (ticketId) {
    try {
      const { json } = await api(`/api/support-tickets/${ticketId}`, { cookie });
      assert.equal(json.success, true);
      pass("Customer: GET /api/support-tickets/:id");
    } catch (e) {
      fail("Customer: GET /api/support-tickets/:id", e);
    }

    try {
      const { json } = await api(`/api/support-tickets/${ticketId}/messages`, { cookie });
      assert.equal(json.success, true);
      const messages = (json.data as { messages?: unknown[] })?.messages;
      assert.ok(Array.isArray(messages) && messages.length > 0);
      pass("Customer: GET /api/support-tickets/:id/messages", `${messages!.length} message(s)`);
    } catch (e) {
      fail("Customer: GET /api/support-tickets/:id/messages", e);
    }

    try {
      const { json } = await api(`/api/support-tickets/${ticketId}/reply`, {
        method: "POST",
        cookie,
        body: JSON.stringify({ message: `${TAG} customer follow-up reply` }),
      });
      assert.equal(json.success, true);
      pass("Customer: POST /api/support-tickets/:id/reply");
    } catch (e) {
      fail("Customer: POST /api/support-tickets/:id/reply", e);
    }
  }

  // Reviews write + helpful (conditional on delivered order)
  const deliveredProductId = customer.orders[0]?.items[0]?.productId;
  if (deliveredProductId) {
    try {
      const { status, json } = await api(`/api/products/${deliveredProductId}/reviews`, {
        method: "POST",
        cookie,
        body: JSON.stringify({
          rating: 5,
          comment: `${TAG} smoke test review — please ignore`,
        }),
      });
      if (status === 200 && json.success) {
        pass("Customer: POST /api/products/:id/reviews", "created");
        const reviewId = (json.data as { review?: { id: string } })?.review?.id;
        if (reviewId) {
          const helpful = await api(`/api/reviews/${reviewId}/helpful`, {
            method: "POST",
            cookie,
            expectStatus: 403,
          });
          assert.equal(helpful.status, 403);
          pass("Customer: POST /api/reviews/:id/helpful (own review blocked)", "403");
        }
      } else if (status === 400 && json.error?.message?.includes("already reviewed")) {
        pass("Customer: POST /api/products/:id/reviews", "already reviewed — ok");
        const { json: listJson } = await api(`/api/products/${deliveredProductId}/reviews`, {
          cookie,
        });
        const reviews = listJson.data as Array<{ id: string }> | undefined;
        const otherReview = Array.isArray(reviews) ? reviews.find((r) => r.id) : null;
        if (otherReview?.id) {
          const { json: voteJson } = await api(`/api/reviews/${otherReview.id}/helpful`, {
            method: "POST",
            cookie,
          });
          assert.equal(voteJson.success, true);
          pass("Customer: POST /api/reviews/:id/helpful", "toggled");
        }
      } else {
        throw new Error(`Unexpected status ${status}: ${JSON.stringify(json)}`);
      }
    } catch (e) {
      fail("Customer: reviews write/helpful flow", e);
    }
  } else {
    pass("Customer: POST /api/products/:id/reviews", "skipped — no delivered order");
    pass("Customer: POST /api/reviews/:id/helpful", "skipped — no delivered order");
  }

  // Product detail page route (SSR page smoke)
  if (product.slug) {
    try {
      const res = await fetch(`${BASE}/product/${product.slug}`, {
        signal: AbortSignal.timeout(30_000),
      });
      assert.ok(res.ok, `product page HTTP ${res.status}`);
      pass("Pages: GET /product/[slug]", product.slug);
    } catch (e) {
      fail("Pages: GET /product/[slug]", e);
    }
  }

  for (const path of ["/", "/my-orders", "/wishlist", "/notifications", "/support-tickets"]) {
    try {
      const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(30_000) });
      assert.ok(res.ok, `${path} HTTP ${res.status}`);
      pass(`Pages: GET ${path}`, `HTTP ${res.status}`);
    } catch (e) {
      fail(`Pages: GET ${path}`, e);
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n--- Summary ---");
  console.log(`Passed: ${results.filter((r) => r.pass).length}/${results.length}`);
  if (failed.length > 0) {
    console.error("Failed:");
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nAll customer smoke tests passed.\n");
}

main()
  .catch((err) => {
    console.error("[smoke-test-customer] fatal:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
