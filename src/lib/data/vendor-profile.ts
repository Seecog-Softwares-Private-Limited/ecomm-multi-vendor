import { prisma } from "@/lib/prisma";

export interface VendorProfileBusiness {
  displayName: string;
  legalName: string;
  businessType: string;
  pan: string;
  gstin: string;
  gstNotApplicable: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  pickupPincode: string;
  storeLogo: string;
  storeDescription: string;
}

export interface VendorProfileOwner {
  ownerName: string;
  mobile: string;
  mobileVerified: boolean;
  email: string;
  emailVerified: boolean;
}

export interface VendorProfileBank {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  bankProofUrl: string | null;
}

export interface VendorProfileDocument {
  documentType: string;
  fileUrl: string | null;
  status: string;
}

export interface VendorProfileDocumentDynamic {
  documentName: string;
  documentUrl: string;
}

export interface VendorProfileData {
  status: "draft" | "submitted" | "approved" | "rejected" | "suspended" | "on_hold";
  statusReason?: string | null;
  primaryCategoryId?: string | null;
  business: VendorProfileBusiness;
  owner: VendorProfileOwner;
  bank: VendorProfileBank | null;
  documents: VendorProfileDocument[];
  vendorDocuments: VendorProfileDocumentDynamic[];
}

interface ProfileExtras {
  legalName?: string;
  businessType?: string;
  pan?: string;
  gstin?: string;
  gstNotApplicable?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pickupPincode?: string;
  storeLogo?: string;
  storeDescription?: string;
}

/** Mask account number for vendor-facing responses; admin APIs return full number. */
export function maskAccountNumber(acc: string | null | undefined): string {
  if (!acc || typeof acc !== "string") return "—";
  const s = acc.trim();
  if (s.length <= 4) return "xxxx";
  return "xxxxxx" + s.slice(-4);
}

/** True if value looks like our masked format (e.g. xxxxxx1234). Never save this to DB. */
export function looksLikeMaskedAccountNumber(acc: string | null | undefined): boolean {
  if (!acc || typeof acc !== "string") return false;
  const s = acc.trim();
  return /^x{4,}\d{1,4}$/i.test(s) || s === "xxxx";
}

function parseProfileExtras(raw: string | null): ProfileExtras {
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw) as ProfileExtras;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function mapSellerStatus(s: string): VendorProfileData["status"] {
  switch (s) {
    case "DRAFT":
    case "PENDING_VERIFICATION":
    case "UNDER_REVIEW":
      return "draft";
    case "SUBMITTED":
      return "submitted";
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "SUSPENDED":
      return "suspended";
    case "ON_HOLD":
      return "on_hold";
    default:
      return "draft";
  }
}

export async function getVendorProfile(sellerId: string): Promise<VendorProfileData | null> {
  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: {
      id: true,
      businessName: true,
      ownerName: true,
      phone: true,
      email: true,
      profileExtras: true,
      status: true,
      statusReason: true,
      primaryCategoryId: true,
      bankAccounts: { where: { deletedAt: null, isPrimary: true }, take: 1 },
      kycDocuments: { where: { deletedAt: null } },
      vendorDocuments: { where: { deletedAt: null }, select: { documentName: true, documentUrl: true } },
    },
  });
  if (!seller) return null;

  const bank = seller.bankAccounts?.[0];
  const extras = parseProfileExtras(seller.profileExtras);
  const docByType = new Map(
    seller.kycDocuments.map((d) => [
      d.documentType,
      { documentType: d.documentType, fileUrl: d.fileUrl, status: d.status },
    ])
  );

  return {
    status: mapSellerStatus(seller.status),
    statusReason: seller.statusReason ?? null,
    primaryCategoryId: seller.primaryCategoryId ?? null,
    business: {
      displayName: seller.businessName ?? "",
      legalName: extras.legalName ?? "",
      businessType: extras.businessType ?? "company",
      pan: extras.pan ?? "",
      gstin: extras.gstin ?? "",
      gstNotApplicable: !!extras.gstNotApplicable,
      addressLine1: extras.addressLine1 ?? "",
      addressLine2: extras.addressLine2 ?? "",
      city: extras.city ?? "",
      state: extras.state ?? "",
      pincode: extras.pincode ?? "",
      pickupPincode: extras.pickupPincode ?? extras.pincode ?? "",
      storeLogo: extras.storeLogo ?? "",
      storeDescription: extras.storeDescription ?? "",
    },
    owner: {
      ownerName: seller.ownerName ?? "",
      mobile: seller.phone ?? "",
      mobileVerified: true,
      email: seller.email ?? "",
      emailVerified: true,
    },
    bank: bank
      ? {
          accountHolderName: bank.accountHolderName,
          accountNumber: bank.accountNumber,
          ifsc: bank.ifscCode,
          bankName: bank.bankName,
          bankProofUrl: (docByType.get("ADDRESS_PROOF") as { fileUrl: string | null } | undefined)?.fileUrl ?? null,
        }
      : null,
    documents: [
      { documentType: "PAN", fileUrl: (docByType.get("PAN") as { fileUrl: string | null } | undefined)?.fileUrl ?? null, status: (docByType.get("PAN") as { status: string } | undefined)?.status ?? "PENDING" },
      { documentType: "GST_CERTIFICATE", fileUrl: (docByType.get("GST_CERTIFICATE") as { fileUrl: string | null } | undefined)?.fileUrl ?? null, status: (docByType.get("GST_CERTIFICATE") as { status: string } | undefined)?.status ?? "PENDING" },
      { documentType: "ADDRESS_PROOF", fileUrl: (docByType.get("ADDRESS_PROOF") as { fileUrl: string | null } | undefined)?.fileUrl ?? null, status: (docByType.get("ADDRESS_PROOF") as { status: string } | undefined)?.status ?? "PENDING" },
    ],
    vendorDocuments: seller.vendorDocuments ?? [],
  };
}

export async function upsertVendorDocument(
  sellerId: string,
  documentName: string,
  documentUrl: string
): Promise<void> {
  const existing = await prisma.vendorDocument.findFirst({
    where: { sellerId, documentName, deletedAt: null },
  });
  if (existing) {
    await prisma.vendorDocument.update({
      where: { id: existing.id },
      data: { documentUrl },
    });
  } else {
    await prisma.vendorDocument.create({
      data: { sellerId, documentName, documentUrl },
    });
  }
}

export interface UpdateVendorProfilePayload {
  business?: Partial<VendorProfileBusiness>;
  owner?: Partial<VendorProfileOwner>;
  bank?: Partial<VendorProfileBank>;
  status?: "draft" | "submitted";
  primaryCategoryId?: string | null;
}

export async function updateVendorProfile(
  sellerId: string,
  payload: UpdateVendorProfilePayload
): Promise<void> {
  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { id: true, profileExtras: true },
  });
  if (!seller) return;

  const extras = parseProfileExtras(seller.profileExtras);

  const sellerUpdate: {
    businessName?: string;
    ownerName?: string;
    phone?: string | null;
    email?: string;
    profileExtras?: string;
    status?: "DRAFT" | "SUBMITTED";
    primaryCategoryId?: string | null;
  } = {};

    if (payload.business) {
    const b = payload.business;
    if (b.displayName !== undefined) sellerUpdate.businessName = b.displayName;
    const newExtras: ProfileExtras = {
      ...extras,
      ...(b.legalName !== undefined && { legalName: b.legalName }),
      ...(b.businessType !== undefined && { businessType: b.businessType }),
      ...(b.pan !== undefined && { pan: b.pan }),
      ...(b.gstin !== undefined && { gstin: b.gstin }),
      ...(b.gstNotApplicable !== undefined && { gstNotApplicable: b.gstNotApplicable }),
      ...(b.addressLine1 !== undefined && { addressLine1: b.addressLine1 }),
      ...(b.addressLine2 !== undefined && { addressLine2: b.addressLine2 }),
      ...(b.city !== undefined && { city: b.city }),
      ...(b.state !== undefined && { state: b.state }),
      ...(b.pincode !== undefined && { pincode: b.pincode }),
      ...(b.pickupPincode !== undefined && { pickupPincode: b.pickupPincode }),
      ...(b.storeLogo !== undefined && { storeLogo: b.storeLogo }),
      ...(b.storeDescription !== undefined && { storeDescription: b.storeDescription }),
    };
    sellerUpdate.profileExtras = JSON.stringify(newExtras);
  }

  if (payload.owner) {
    const o = payload.owner;
    if (o.ownerName !== undefined) sellerUpdate.ownerName = o.ownerName;
    if (o.mobile !== undefined) sellerUpdate.phone = o.mobile;
    if (o.email !== undefined) sellerUpdate.email = o.email;
  }

  if (payload.status === "submitted") sellerUpdate.status = "SUBMITTED";
  if (payload.primaryCategoryId !== undefined) sellerUpdate.primaryCategoryId = payload.primaryCategoryId;

  if (Object.keys(sellerUpdate).length > 0) {
    await prisma.seller.update({
      where: { id: sellerId },
      data: sellerUpdate,
    });
  }

  if (payload.bank) {
    const b = payload.bank;
    const existing = await prisma.bankAccount.findFirst({
      where: { sellerId, deletedAt: null, isPrimary: true },
    });
    const rawAccountNumber = (b.accountNumber ?? "").trim();
    const accountNumberToSave =
      rawAccountNumber && !looksLikeMaskedAccountNumber(rawAccountNumber)
        ? rawAccountNumber
        : existing?.accountNumber ?? "";
    const bankData = {
      accountHolderName: b.accountHolderName ?? "",
      accountNumber: accountNumberToSave,
      ifscCode: b.ifsc ?? "",
      bankName: b.bankName ?? "",
    };
    if (existing) {
      await prisma.bankAccount.update({
        where: { id: existing.id },
        data: bankData,
      });
    } else {
      await prisma.bankAccount.create({
        data: {
          sellerId,
          ...bankData,
          isPrimary: true,
        },
      });
    }
  }
}

export async function upsertKycDocument(
  sellerId: string,
  documentType: "PAN" | "GST_CERTIFICATE" | "ADDRESS_PROOF",
  fileUrl: string
): Promise<void> {
  const existing = await prisma.kYCDocument.findFirst({
    where: { sellerId, documentType, deletedAt: null },
  });
  if (existing) {
    await prisma.kYCDocument.update({
      where: { id: existing.id },
      data: { fileUrl, status: "PENDING" },
    });
  } else {
    await prisma.kYCDocument.create({
      data: {
        sellerId,
        documentType,
        fileUrl,
        status: "PENDING",
      },
    });
  }
}
