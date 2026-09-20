/**
 * Unit tests for Vendor Google linking helper (in-memory DB mock).
 * Run: npx tsx scripts/test-vendor-link-google.ts
 */

import assert from "node:assert/strict";
import {
  linkGoogleToVendorSeller,
  VendorGoogleLinkError,
  type VendorGoogleLinkDb,
} from "../src/lib/auth/link-vendor-google";

type SellerRow = {
  id: string;
  oauthProvider: string | null;
  oauthProviderId: string | null;
};

function makeDb(sellers: SellerRow[]): VendorGoogleLinkDb {
  return {
    seller: {
      findFirst: async (args) => {
        const where = args.where as {
          id?: string;
          oauthProvider?: string;
          oauthProviderId?: string;
          NOT?: { id?: string };
        };
        const notId = where.NOT?.id;
        for (const s of sellers) {
          if (where.id && s.id !== where.id) continue;
          if (where.oauthProvider && s.oauthProvider !== where.oauthProvider) continue;
          if (where.oauthProviderId && s.oauthProviderId !== where.oauthProviderId) continue;
          if (notId && s.id === notId) continue;
          return {
            id: s.id,
            oauthProvider: s.oauthProvider,
            oauthProviderId: s.oauthProviderId,
          };
        }
        return null;
      },
      update: async (args) => {
        const s = sellers.find((x) => x.id === args.where.id);
        if (!s) throw new Error("missing");
        const clash = sellers.find(
          (x) =>
            x.id !== s.id &&
            x.oauthProvider === args.data.oauthProvider &&
            x.oauthProviderId === args.data.oauthProviderId
        );
        if (clash) {
          throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
        }
        s.oauthProvider = args.data.oauthProvider;
        s.oauthProviderId = args.data.oauthProviderId;
        return s;
      },
    },
  };
}

async function main() {
  // Test 2 — link Google to password Seller
  {
    const sellers: SellerRow[] = [{ id: "seller-a", oauthProvider: null, oauthProviderId: null }];
    const db = makeDb(sellers);
    const linked = await linkGoogleToVendorSeller("seller-a", "google-sub-1", db);
    assert.equal(linked.alreadyLinked, false);
    assert.equal(sellers[0].oauthProvider, "google");
    assert.equal(sellers[0].oauthProviderId, "google-sub-1");

    const again = await linkGoogleToVendorSeller("seller-a", "google-sub-1", db);
    assert.equal(again.alreadyLinked, true);
  }

  // Test 3 / 4 — same Google cannot attach to Seller B
  {
    const sellers: SellerRow[] = [
      { id: "seller-a", oauthProvider: "google", oauthProviderId: "google-sub-1" },
      { id: "seller-b", oauthProvider: null, oauthProviderId: null },
    ];
    const db = makeDb(sellers);
    await assert.rejects(
      () => linkGoogleToVendorSeller("seller-b", "google-sub-1", db),
      (err: unknown) =>
        err instanceof VendorGoogleLinkError && err.code === "GOOGLE_IDENTITY_ALREADY_LINKED"
    );
  }

  // Test 5 — unauthenticated / empty seller
  await assert.rejects(
    () => linkGoogleToVendorSeller("", "google-sub-x", makeDb([])),
    (err: unknown) =>
      err instanceof VendorGoogleLinkError && err.code === "VENDOR_AUTH_REQUIRED"
  );

  // Test 6 — helper has no email argument (cannot auto-link by email)
  {
    const sellers: SellerRow[] = [{ id: "seller-c", oauthProvider: null, oauthProviderId: null }];
    const db = makeDb(sellers);
    await linkGoogleToVendorSeller("seller-c", "google-sub-c", db);
    assert.equal(sellers[0].oauthProviderId, "google-sub-c");
  }

  // Different Google identity already on this Seller
  {
    const sellers: SellerRow[] = [
      { id: "seller-d", oauthProvider: "google", oauthProviderId: "google-sub-old" },
    ];
    await assert.rejects(
      () => linkGoogleToVendorSeller("seller-d", "google-sub-new", makeDb(sellers)),
      (err: unknown) =>
        err instanceof VendorGoogleLinkError && err.code === "GOOGLE_ACCOUNT_CONFLICT"
    );
  }

  console.log("test-vendor-link-google: ok");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
