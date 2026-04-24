"use client";

import {
  Save,
  Send,
  Building,
  CreditCard,
  FileText,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import { Button, Input, Select, Toggle, FileUpload, Card, Alert } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import {
  isProfileComplete,
  isTabComplete,
  isCategoryDocumentsComplete,
  isBusinessInfoComplete,
  isKycDetailsComplete,
  isBankDetailsComplete,
  profileToValidationShape,
  type TabName,
} from "@/lib/utils/vendorValidation";
import * as React from "react";
import {
  VENDOR_BUSINESS_TYPE_OPTIONS,
  parseStoredVendorBusinessType,
  resolveVendorBusinessTypeForApi,
} from "@/lib/constants/vendor-business-type";

// ─── Inline OTP verification widget ─────────────────────────────────────────
type OtpVerifyFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  isVerified: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  helperText?: string;
  onSendOtp: () => Promise<{ devOtp?: string }>;
  onConfirmOtp: (code: string) => Promise<void>;
  onVerified: () => void;
};

function OtpVerifyField({
  label,
  value,
  onChange,
  isVerified,
  disabled,
  type = "text",
  placeholder,
  helperText,
  onSendOtp,
  onConfirmOtp,
  onVerified,
}: OtpVerifyFieldProps) {
  const [stage, setStage] = React.useState<"idle" | "sending" | "awaiting" | "confirming" | "done">("idle");
  const [otp, setOtp] = React.useState("");
  const [countdown, setCountdown] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [devHint, setDevHint] = React.useState<string | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (isVerified) setStage("done");
  }, [isVerified]);

  const startCountdown = (secs: number) => {
    setCountdown(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  React.useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSend = async () => {
    setError(null);
    setStage("sending");
    try {
      const res = await onSendOtp();
      setDevHint(res.devOtp ? `Dev code: ${res.devOtp}` : null);
      startCountdown(60);
      setOtp("");
      setStage("awaiting");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send code.");
      setStage("idle");
    }
  };

  const handleConfirm = async () => {
    if (!/^\d{4,9}$/.test(otp.trim())) {
      setError("Enter the OTP you received (4–9 digits).");
      return;
    }
    setError(null);
    setStage("confirming");
    try {
      await onConfirmOtp(otp.trim());
      setStage("done");
      setDevHint(null);
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Incorrect code.");
      setStage("awaiting");
    }
  };

  const verified = stage === "done" || isVerified;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#1E293B]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled || verified}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            disabled || verified
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
              : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500"
          }`}
        />
        {verified ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            <ShieldCheck size={14} /> Verified
          </span>
        ) : stage === "idle" || stage === "sending" ? (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || stage === "sending" || !value.trim()}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {stage === "sending" ? "Sending…" : "Send OTP"}
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
            <ShieldAlert size={14} /> Unverified
          </span>
        )}
      </div>

      {(stage === "awaiting" || stage === "confirming") && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={9}
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 9))}
            className="w-36 rounded-xl border border-slate-200 px-3 py-2.5 text-center text-lg font-bold tracking-[0.3em] text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={handleConfirm}
            disabled={stage === "confirming" || otp.length < 4}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {stage === "confirming" ? "Verifying…" : "Verify"}
          </button>
          {countdown > 0 ? (
            <span className="text-xs text-slate-500">Resend in {countdown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Resend code
            </button>
          )}
        </div>
      )}

      {devHint && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-mono text-amber-800">{devHint}</p>
      )}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const defaultFormData = {
  displayName: "",
  legalName: "",
  businessType: "proprietorship",
  businessTypeCustom: "",
  gstin: "",
  gstNotApplicable: false,
  pan: "",
  websiteUrl: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "Karnataka",
  pincode: "",
  pickupPincode: "",
  ownerName: "",
  mobile: "",
  mobileVerified: true,
  email: "",
  emailVerified: true,
  accountHolderName: "",
  accountNumber: "",
  ifsc: "",
  bankName: "HDFC Bank",
  storeLogo: "",
  storeDescription: "",
  primaryCategoryId: "",
  /** Category IDs the vendor can sell in (multi-select). */
  allowedCategoryIds: [] as string[],
};

const TABS: { id: TabName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "business_info", label: "Business Info", icon: Building },
  { id: "kyc_details", label: "KYC Details", icon: FileText },
  { id: "bank_details", label: "Bank Details", icon: CreditCard },
];

export function VendorProfile() {
  const [formData, setFormData] = React.useState(defaultFormData);
  const [activeTab, setActiveTab] = React.useState<TabName>("business_info");
  const [saving, setSaving] = React.useState(false);
  const [uploadingDoc, setUploadingDoc] = React.useState<string | null>(null);
  const [uploadingVendorDoc, setUploadingVendorDoc] = React.useState<string | null>(null);
  const [categoryDocRequirements, setCategoryDocRequirements] = React.useState<
    { documentName: string; isRequired: boolean }[]
  >([]);
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState<string | null>(null);
  const [uploadErrorByType, setUploadErrorByType] = React.useState<Record<string, string | null>>({});
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = React.useState(false);
  const categoriesDropdownRef = React.useRef<HTMLDivElement>(null);

  // ── Extra (custom) documents ─────────────────────────────────────────────
  const [addDocOpen, setAddDocOpen] = React.useState(false);
  const [newDocName, setNewDocName] = React.useState("");
  const [newDocFile, setNewDocFile] = React.useState<File | null>(null);
  const [newDocError, setNewDocError] = React.useState<string | null>(null);
  const [uploadingExtraDoc, setUploadingExtraDoc] = React.useState(false);
  const [deletingDocId, setDeletingDocId] = React.useState<string | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    }
    if (categoriesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categoriesDropdownOpen]);

  const { data: profile, error, isLoading, refetch } = useApi(() =>
    vendorService.getProfile()
  );

  const status = profile?.status ?? "draft";
  /** After admin approves KYC, identity, documents, bank, and categories are server-enforced read-only. */
  const kycLocked = status === "approved";

  // Only sync profile → formData on initial load, not after refetch (so upload/category change don't wipe unsaved fields)
  const hasSyncedProfileRef = React.useRef(false);
  React.useEffect(() => {
    if (!profile) {
      hasSyncedProfileRef.current = false;
      return;
    }
    if (hasSyncedProfileRef.current) return;
    hasSyncedProfileRef.current = true;
    setFormData((prev) => {
      const bt = parseStoredVendorBusinessType(profile.business.businessType);
      return {
      ...prev,
      displayName: profile.business.displayName,
      legalName: profile.business.legalName,
      businessType: bt.value,
      businessTypeCustom: bt.custom,
      gstin: profile.business.gstin,
      gstNotApplicable: profile.business.gstNotApplicable,
      pan: profile.business.pan,
      websiteUrl: profile.business.websiteUrl ?? "",
      addressLine1: profile.business.addressLine1,
      addressLine2: profile.business.addressLine2,
      city: profile.business.city,
      state: profile.business.state,
      pincode: profile.business.pincode,
      pickupPincode: profile.business.pickupPincode,
      ownerName: profile.owner.ownerName,
      mobile: profile.owner.mobile,
      mobileVerified: profile.owner.mobileVerified,
      email: profile.owner.email,
      emailVerified: profile.owner.emailVerified,
      accountHolderName: profile.bank?.accountHolderName ?? "",
      accountNumber: profile.bank?.accountNumber ?? "",
      ifsc: profile.bank?.ifsc ?? "",
      bankName: profile.bank?.bankName ?? "HDFC Bank",
      storeLogo: profile.business.storeLogo ?? "",
      storeDescription: profile.business.storeDescription ?? "",
      primaryCategoryId: profile.primaryCategoryId ?? "",
      allowedCategoryIds: profile.allowedCategoryIds ?? (profile.primaryCategoryId ? [profile.primaryCategoryId] : []),
    };
    });
  }, [profile]);

  React.useEffect(() => {
    vendorService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  React.useEffect(() => {
    const id =
      formData.primaryCategoryId ||
      profile?.primaryCategoryId ||
      (formData.allowedCategoryIds?.length ? formData.allowedCategoryIds[0] : null);
    if (!id) {
      setCategoryDocRequirements([]);
      return;
    }
    vendorService
      .getCategoryDocumentRequirements(id)
      .then(setCategoryDocRequirements)
      .catch(() => setCategoryDocRequirements([]));
  }, [formData.primaryCategoryId, formData.allowedCategoryIds, profile?.primaryCategoryId]);

  const vendorProfile = React.useMemo(() => {
    const business = {
      displayName: formData.displayName,
      legalName: formData.legalName,
      pan: formData.pan,
      gstin: formData.gstin,
      addressLine1: formData.addressLine1,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      storeLogo: formData.storeLogo,
      storeDescription: formData.storeDescription,
    };
    const bank = {
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      ifsc: formData.ifsc,
    };
    return profileToValidationShape({
      business,
      documents: profile?.documents ?? [],
      bank: bank.accountHolderName || bank.accountNumber || bank.ifsc ? bank : null,
    });
  }, [formData, profile]);

  const requiredCategoryDocNames = React.useMemo(
    () => categoryDocRequirements.filter((d) => d.isRequired).map((d) => d.documentName),
    [categoryDocRequirements]
  );
  const uploadedCategoryDocNames = React.useMemo(
    () => profile?.vendorDocuments?.map((d) => d.documentName) ?? [],
    [profile?.vendorDocuments]
  );
  const categoryDocsComplete = isCategoryDocumentsComplete(
    requiredCategoryDocNames,
    uploadedCategoryDocNames
  );
  const profileComplete =
    isProfileComplete(vendorProfile, formData.gstNotApplicable) && categoryDocsComplete;

  const businessComplete = isBusinessInfoComplete(vendorProfile, formData.gstNotApplicable);
  const kycComplete = isKycDetailsComplete(vendorProfile, formData.gstNotApplicable);
  const bankComplete = isBankDetailsComplete(vendorProfile);
  const missingForSubmit: string[] = [];
  if (!businessComplete) missingForSubmit.push("Business Info");
  if (!kycComplete) missingForSubmit.push("KYC Details (PAN & GST certificate)");
  if (!bankComplete) missingForSubmit.push("Bank Details");
  if (!categoryDocsComplete && requiredCategoryDocNames.length > 0) {
    const missing = requiredCategoryDocNames.filter(
      (name) =>
        !uploadedCategoryDocNames.some(
          (u) => u.trim().toLowerCase() === name.trim().toLowerCase()
        )
    );
    if (missing.length > 0) {
      missingForSubmit.push(`Required category documents: ${missing.join(", ")}`);
    } else {
      missingForSubmit.push("Required category documents");
    }
  }

  const validateBusinessType = (): string | null => {
    if (formData.businessType === "other" && !formData.businessTypeCustom.trim()) {
      return 'Please enter your business type when "Others" is selected.';
    }
    return null;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setSubmitError(null);
    const btErr = kycLocked ? null : validateBusinessType();
    if (btErr) {
      setSubmitError(btErr);
      setSaving(false);
      return;
    }
    try {
      await vendorService.updateProfile(
        kycLocked
          ? {
              business: {
                displayName: formData.displayName,
                websiteUrl: formData.websiteUrl,
                storeLogo: formData.storeLogo,
                storeDescription: formData.storeDescription,
                pickupPincode: formData.pickupPincode,
              },
            }
          : {
              business: {
                displayName: formData.displayName,
                legalName: formData.legalName,
                businessType: resolveVendorBusinessTypeForApi(
                  formData.businessType,
                  formData.businessTypeCustom
                ),
                pan: formData.pan,
                gstin: formData.gstin,
                gstNotApplicable: formData.gstNotApplicable,
                websiteUrl: formData.websiteUrl,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                pickupPincode: formData.pickupPincode,
                storeLogo: formData.storeLogo,
                storeDescription: formData.storeDescription,
              },
              owner: {
                ownerName: formData.ownerName,
                mobile: formData.mobile,
                email: formData.email,
              },
              bank: {
                accountHolderName: formData.accountHolderName,
                accountNumber: formData.accountNumber,
                ifsc: formData.ifsc,
                bankName: formData.bankName,
              },
              primaryCategoryId: formData.allowedCategoryIds?.length
                ? formData.allowedCategoryIds[0]
                : formData.primaryCategoryId || null,
              allowedCategoryIds: formData.allowedCategoryIds,
              status: "draft",
            }
      );
      await refetch();
      setSuccessMessage("Draft saved successfully.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save draft";
      setSuccessMessage(null);
      setSubmitError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (kycLocked) {
      setSubmitError("Your KYC is already approved; you cannot submit again.");
      return;
    }
    setSaving(true);
    setSuccessMessage(null);
    setSubmitError(null);
    const btErr = validateBusinessType();
    if (btErr) {
      setSubmitError(btErr);
      setSaving(false);
      return;
    }
    try {
      // Save current form data first so the server validates the latest values
      await vendorService.updateProfile({
        business: {
          displayName: formData.displayName,
          legalName: formData.legalName,
          businessType: resolveVendorBusinessTypeForApi(
            formData.businessType,
            formData.businessTypeCustom
          ),
          pan: formData.pan,
          gstin: formData.gstin,
          gstNotApplicable: formData.gstNotApplicable,
          websiteUrl: formData.websiteUrl,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          pickupPincode: formData.pickupPincode,
          storeLogo: formData.storeLogo,
          storeDescription: formData.storeDescription,
        },
        owner: {
          ownerName: formData.ownerName,
          mobile: formData.mobile,
          email: formData.email,
        },
        bank: {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          bankName: formData.bankName,
        },
        primaryCategoryId: formData.allowedCategoryIds?.length ? formData.allowedCategoryIds[0] : formData.primaryCategoryId || null,
        allowedCategoryIds: formData.allowedCategoryIds,
        status: "draft",
      });
      await vendorService.submitForApproval();
      await refetch();
      setSuccessMessage("Profile submitted for approval.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit for approval";
      setSuccessMessage(null);
      setSubmitError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleKycUpload = React.useCallback(
    (documentType: "PAN" | "GST_CERTIFICATE" | "ADDRESS_PROOF") => async (file: File | null) => {
      if (!file || kycLocked) return;
      setUploadingDoc(documentType);
      setUploadSuccess(null);
      setUploadErrorByType((prev) => ({ ...prev, [documentType]: null }));
      try {
        await vendorService.uploadKycDocument(documentType, file);
        await refetch();
        const label =
          documentType === "PAN"
            ? "PAN card"
            : documentType === "GST_CERTIFICATE"
              ? "GST certificate"
              : "Cancelled cheque / bank proof";
        setUploadSuccess(`${label} uploaded successfully.`);
        setTimeout(() => setUploadSuccess(null), 5000);
      } catch (e) {
        setUploadSuccess(null);
        const msg = e instanceof Error ? e.message : "Upload failed";
        setUploadErrorByType((prev) => ({ ...prev, [documentType]: msg }));
        setTimeout(() => setUploadErrorByType((prev) => ({ ...prev, [documentType]: null })), 8000);
      } finally {
        setUploadingDoc(null);
      }
    },
    [refetch, kycLocked]
  );

  const panUrl = profile?.documents?.find((d) => d.documentType === "PAN")?.fileUrl ?? null;
  const gstUrl =
    profile?.documents?.find((d) => d.documentType === "GST_CERTIFICATE")?.fileUrl ?? null;
  const addressProofUrl =
    profile?.documents?.find((d) => d.documentType === "ADDRESS_PROOF")?.fileUrl ?? null;

  const handleVendorDocUpload = React.useCallback(
    (documentName: string) => async (file: File | null) => {
      if (!file || kycLocked) return;
      setUploadingVendorDoc(documentName);
      setUploadErrorByType((prev) => ({ ...prev, [documentName]: null }));
      try {
        await vendorService.uploadVendorDocument(documentName, file);
        await refetch();
        setUploadSuccess(`${documentName} uploaded.`);
        setTimeout(() => setUploadSuccess(null), 5000);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setUploadErrorByType((prev) => ({ ...prev, [documentName]: msg }));
      } finally {
        setUploadingVendorDoc(null);
      }
    },
    [refetch, kycLocked]
  );

  const handleAddExtraDoc = React.useCallback(async () => {
    if (!newDocName.trim()) { setNewDocError("Enter a document name."); return; }
    if (!newDocFile) { setNewDocError("Select a file to upload."); return; }
    // Disallow names that clash with fixed KYC docs
    const reserved = ["PAN", "GST_CERTIFICATE", "ADDRESS_PROOF"];
    if (reserved.includes(newDocName.trim().toUpperCase().replace(/\s+/g, "_"))) {
      setNewDocError("That name is reserved. Choose a different name.");
      return;
    }
    setNewDocError(null);
    setUploadingExtraDoc(true);
    try {
      await vendorService.uploadVendorDocument(newDocName.trim(), newDocFile);
      await refetch();
      setNewDocName("");
      setNewDocFile(null);
      setAddDocOpen(false);
      setUploadSuccess("Document uploaded successfully.");
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (e) {
      setNewDocError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploadingExtraDoc(false);
    }
  }, [newDocName, newDocFile, refetch]);

  const handleDeleteExtraDoc = React.useCallback(async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingDocId(id);
    try {
      await vendorService.deleteVendorDocument(id);
      await refetch();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to delete document.");
    } finally {
      setDeletingDocId(null);
    }
  }, [refetch]);

  const handleAllowedCategoriesChange = React.useCallback(
    async (categoryId: string, checked: boolean) => {
      if (kycLocked) return;
      const next = checked
        ? [...(formData.allowedCategoryIds || []), categoryId]
        : (formData.allowedCategoryIds || []).filter((id) => id !== categoryId);
      setFormData((prev) => ({
        ...prev,
        allowedCategoryIds: next,
        primaryCategoryId: next.length ? next[0] : prev.primaryCategoryId,
      }));
      try {
        await vendorService.updateProfile({
          allowedCategoryIds: next,
          primaryCategoryId: next.length ? next[0] : null,
        });
        await refetch();
      } catch {
        setFormData((prev) => ({ ...prev, allowedCategoryIds: formData.allowedCategoryIds || [] }));
      }
    },
    [formData.allowedCategoryIds, refetch, kycLocked]
  );

  const statusLabel =
    status === "approved"
      ? "Approved"
      : status === "submitted"
        ? "Pending"
        : status === "rejected"
          ? "Rejected"
          : status === "on_hold"
            ? "On Hold"
            : status === "suspended"
              ? "Blocked"
              : "Draft";
  const showReason =
    (status === "rejected" || status === "suspended" || status === "on_hold") &&
    profile?.statusReason;

  return (
    <DataState isLoading={isLoading} error={error} retry={refetch}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40">
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Vendor Profile & KYC
              </h1>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                  status === "approved"
                    ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                    : status === "submitted"
                      ? "bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20"
                      : status === "rejected" || status === "suspended"
                        ? "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20"
                        : status === "on_hold"
                          ? "bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20"
                          : "bg-slate-100 text-slate-700 ring-1 ring-slate-400/30"
                }`}
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-80" />
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {kycLocked
                ? "Verified KYC and bank details are locked. You can still update your public store name, website, and other storefront fields where shown below."
                : "Complete all tabs below to enable Submit for Approval."}
            </p>
          </div>

        {showReason && (
          <Alert
            type="error"
            title="Reason"
            message={profile.statusReason ?? ""}
          />
        )}

        {status === "submitted" && !showReason && (
          <Alert
            type="info"
            title="Profile Under Review"
            message="Your profile is being reviewed by our team. We'll notify you once approved."
          />
        )}
        {status === "approved" && (
          <Alert
            type="info"
            title="Profile approved"
            message="Your KYC, documents, bank details, and categories are locked. Use Update Profile to save changes to your storefront display name, website, logo, description, and pickup pincode only."
          />
        )}
        {status === "rejected" && !showReason && (
          <Alert
            type="error"
            title="KYC Rejected"
            message="Your KYC or profile has been rejected. Please check the reason above (if provided) and resubmit after correcting the details."
          />
        )}
        {status === "suspended" && !showReason && (
          <Alert
            type="error"
            title="Account Blocked"
            message="Your account has been blocked. Contact support if you believe this is an error."
          />
        )}
        {status === "on_hold" && !showReason && (
          <Alert
            type="info"
            title="On Hold"
            message="Your account is on hold. We'll notify you once the review is complete."
          />
        )}

        {successMessage && <Alert type="info" title="Success" message={successMessage} />}
        {submitError && (
          <Alert
            type="error"
            title="Cannot submit"
            message={submitError}
          />
        )}
        {uploadSuccess && (
          <Alert type="info" title="Upload" message={uploadSuccess} />
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-1.5 shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const tabComplete = isTabComplete(tab.id, vendorProfile, formData.gstNotApplicable);
            const complete =
              tab.id === "kyc_details"
                ? tabComplete && categoryDocsComplete
                : tabComplete;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-800"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                {complete ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Complete" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" aria-label="Incomplete" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "business_info" && (
          <Card title="Business Info">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Business Name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  helperText="Display name shown to customers"
                  required
                />
                <Input
                  label="Legal Business Name"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  helperText="As per official documents"
                  disabled={kycLocked}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="PAN Number"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  helperText="10-character PAN"
                  required
                  disabled={kycLocked}
                />
                <div>
                  <Toggle
                    checked={formData.gstNotApplicable}
                    onChange={(checked) =>
                      setFormData({ ...formData, gstNotApplicable: checked })
                    }
                    label="GST not applicable"
                    disabled={kycLocked}
                  />
                  {!formData.gstNotApplicable && (
                    <Input
                      label="GST Number"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      helperText="15-character GSTIN"
                      required
                      disabled={kycLocked}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Business Type</label>
                <select
                  className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    kycLocked ? "cursor-not-allowed bg-slate-50 text-slate-500" : "cursor-pointer"
                  }`}
                  value={formData.businessType}
                  disabled={kycLocked}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((fd) => ({
                      ...fd,
                      businessType: v,
                      businessTypeCustom: v === "other" ? fd.businessTypeCustom : "",
                    }));
                  }}
                >
                  {VENDOR_BUSINESS_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.businessType === "other" && (
                <Input
                  label="Specify business type"
                  value={formData.businessTypeCustom}
                  onChange={(e) =>
                    setFormData({ ...formData, businessTypeCustom: e.target.value })
                  }
                  helperText="Enter your business structure if it is not listed above"
                  required
                  disabled={kycLocked}
                />
              )}
              <div className="relative" ref={categoriesDropdownRef}>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Categories you sell in
                </label>
                <p className="mb-3 text-xs text-slate-500">
                  Select all categories in which you will add products. You can add products only in these categories.
                </p>
                <button
                  type="button"
                  onClick={() => !kycLocked && setCategoriesDropdownOpen((open) => !open)}
                  disabled={kycLocked}
                  className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    kycLocked
                      ? "cursor-not-allowed opacity-60"
                      : "hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm text-slate-700 truncate mr-2">
                    {(formData.allowedCategoryIds || []).length === 0
                      ? "Select categories..."
                      : (() => {
                          const n = (formData.allowedCategoryIds || []).length;
                          const names = (formData.allowedCategoryIds || [])
                            .map((id) => categories.find((c) => c.id === id)?.name ?? id);
                          return n > 3 ? `${n} categories selected` : names.join(", ");
                        })()}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition ${categoriesDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {categoriesDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-lg max-h-60 overflow-y-auto">
                    {categories.map((c) => {
                      const checked = (formData.allowedCategoryIds || []).includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={kycLocked}
                            onChange={(e) => handleAllowedCategoriesChange(c.id, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
                          />
                          <span className="font-medium">{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {((formData.allowedCategoryIds || []).length > 0) && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Primary category for KYC documents: <strong>{categories.find((c) => c.id === formData.allowedCategoryIds?.[0])?.name ?? formData.allowedCategoryIds?.[0]}</strong>
                  </p>
                )}
              </div>
              <Input
                label="Store / Company website"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://www.example.com"
                helperText="Link to your store or company website (optional)"
              />
              <div className="border-t border-slate-200 pt-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Address</h3>
                <div className="space-y-4">
                  <Input
                    label="Address line 1"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="Building, street, area"
                    helperText="Street address or location"
                    disabled={kycLocked}
                  />
                  <Input
                    label="Address line 2"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="Landmark, floor, etc. (optional)"
                    disabled={kycLocked}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      disabled={kycLocked}
                    />
                    <Input
                      label="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                      disabled={kycLocked}
                    />
                    <Input
                      label="Pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 560001"
                      helperText="6-digit pincode"
                      disabled={kycLocked}
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Owner / Contact</h3>
                <div className="space-y-4">
                  <Input
                    label="Owner Full Name"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    disabled={kycLocked}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OtpVerifyField
                      label="Mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(v) => setFormData({ ...formData, mobile: v, mobileVerified: false })}
                      isVerified={formData.mobileVerified}
                      disabled={kycLocked}
                      placeholder="10-digit mobile number"
                      helperText="We'll send an OTP via MSG91 to this number."
                      onSendOtp={async () => {
                        await handleSaveDraft();
                        return vendorService.sendPhoneOtp();
                      }}
                      onConfirmOtp={async (code) => {
                        await vendorService.confirmPhoneOtp(code);
                      }}
                      onVerified={() => {
                        setFormData((prev) => ({ ...prev, mobileVerified: true }));
                        refetch();
                      }}
                    />
                    <OtpVerifyField
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(v) => setFormData({ ...formData, email: v, emailVerified: false })}
                      isVerified={formData.emailVerified}
                      disabled={kycLocked}
                      placeholder="your@email.com"
                      helperText="A verification code will be sent to this address."
                      onSendOtp={async () => {
                        await handleSaveDraft();
                        return vendorService.sendEmailOtp();
                      }}
                      onConfirmOtp={async (code) => {
                        await vendorService.confirmEmailOtp(code);
                      }}
                      onVerified={() => {
                        setFormData((prev) => ({ ...prev, emailVerified: true }));
                        refetch();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "kyc_details" && (
          <Card title="KYC Details">
            <div className="space-y-6">
              {kycLocked && (
                <Alert
                  type="info"
                  title="KYC locked"
                  message="These documents were verified at approval and cannot be replaced here. Contact support if you need a correction."
                />
              )}
              <Alert
                type="info"
                message="Upload clear, legible documents. PDF, JPG, PNG (Max 5MB each)."
              />
              <FileUpload
                label="PAN Card Image (Required)"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleKycUpload("PAN")}
                helperText="Upload PAN card image or PDF"
                disabled={kycLocked || uploadingDoc === "PAN"}
                uploading={uploadingDoc === "PAN"}
                uploadedUrl={panUrl}
                error={uploadErrorByType.PAN ?? undefined}
              />
              <FileUpload
                label="GST Certificate (Required)"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleKycUpload("GST_CERTIFICATE")}
                helperText="Upload GST registration certificate"
                disabled={kycLocked || uploadingDoc === "GST_CERTIFICATE"}
                uploading={uploadingDoc === "GST_CERTIFICATE"}
                uploadedUrl={gstUrl}
                error={uploadErrorByType.GST_CERTIFICATE ?? undefined}
              />
              <div className="border-t border-slate-200 pt-8">
                <h3 className="mb-1 text-lg font-semibold text-slate-900">Additional documents (by category)</h3>
                <p className="mb-4 text-sm text-slate-500">
                  Based on your Primary Category. Documents marked <strong>Required</strong> must be uploaded to complete your profile.
                </p>
                {!(formData.primaryCategoryId || formData.allowedCategoryIds?.length || profile?.primaryCategoryId || profile?.allowedCategoryIds?.length) ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    Select <strong>Categories you sell in</strong> in the Business Info tab to see optional documents for your category.
                  </p>
                ) : categoryDocRequirements.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    No additional documents defined for your category. PAN and GST Certificate are enough.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryDocRequirements.map((doc) => (
                      <FileUpload
                        key={doc.documentName}
                        label={`${doc.documentName} (${doc.isRequired ? "Required" : "Optional"})`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleVendorDocUpload(doc.documentName)}
                        helperText={doc.isRequired ? "Required to complete your profile and submit for approval." : "Upload if you have this document – you may skip."}
                        disabled={kycLocked || uploadingVendorDoc === doc.documentName}
                        uploading={uploadingVendorDoc === doc.documentName}
                        uploadedUrl={profile?.vendorDocuments?.find((d) => d.documentName === doc.documentName)?.documentUrl}
                        error={uploadErrorByType[doc.documentName] ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Extra (custom) documents ─────────────────────────────── */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Other Documents</h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Upload any additional supporting documents you wish to attach to your profile (e.g. trade licence, certificate, partnership deed, etc.).
                    </p>
                  </div>
                  {!kycLocked && !addDocOpen && (
                    <button
                      type="button"
                      onClick={() => { setAddDocOpen(true); setNewDocError(null); }}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Document
                    </button>
                  )}
                </div>

                {/* Add document form */}
                {addDocOpen && !kycLocked && (
                  <div className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">New Document</p>
                      <button
                        type="button"
                        onClick={() => { setAddDocOpen(false); setNewDocName(""); setNewDocFile(null); setNewDocError(null); }}
                        className="text-slate-400 hover:text-slate-700 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">Document Name / Label <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={newDocName}
                        maxLength={120}
                        placeholder="e.g. Trade Licence, Partnership Deed, ISO Certificate…"
                        onChange={(e) => { setNewDocName(e.target.value); setNewDocError(null); }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">File <span className="text-red-500">*</span></label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => { setNewDocFile(e.target.files?.[0] ?? null); setNewDocError(null); }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-700"
                      />
                      <p className="text-xs text-slate-400">PDF, JPG, PNG — max 5 MB</p>
                    </div>
                    {newDocError && (
                      <p className="text-sm font-medium text-red-600">{newDocError}</p>
                    )}
                    {newDocFile && (
                      <p className="text-xs text-slate-500">Selected: <span className="font-medium">{newDocFile.name}</span> ({(newDocFile.size / 1024).toFixed(0)} KB)</p>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleAddExtraDoc}
                        disabled={uploadingExtraDoc}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploadingExtraDoc ? "Uploading…" : "Upload"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddDocOpen(false); setNewDocName(""); setNewDocFile(null); setNewDocError(null); }}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing extra documents list */}
                {(() => {
                  const categoryDocNames = new Set(
                    categoryDocRequirements.map((d) => d.documentName.trim().toLowerCase())
                  );
                  const extraDocs = (profile?.vendorDocuments ?? []).filter(
                    (d) => !categoryDocNames.has(d.documentName.trim().toLowerCase())
                  );
                  if (extraDocs.length === 0) {
                    return (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
                        <FileText className="mx-auto mb-2 w-8 h-8 text-slate-300" />
                        <p className="text-sm text-slate-500">No additional documents uploaded yet.</p>
                        {kycLocked && (
                          <p className="text-xs text-slate-400 mt-1">Documents are locked after KYC approval.</p>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {extraDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                        >
                          <FileText className="w-5 h-5 shrink-0 text-indigo-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{doc.documentName}</p>
                            <a
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:underline mt-0.5"
                            >
                              View file <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          {!kycLocked && (
                            <button
                              type="button"
                              onClick={() => handleDeleteExtraDoc(doc.id, doc.documentName)}
                              disabled={deletingDocId === doc.id}
                              className="shrink-0 flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingDocId === doc.id ? (
                                "Deleting…"
                              ) : (
                                <><Trash2 className="w-3.5 h-3.5" /> Remove</>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "bank_details" && (
          <Card title="Bank Details">
            <div className="space-y-6">
              <Alert
                type="info"
                message={
                  kycLocked
                    ? "Bank details were verified at approval and cannot be changed here."
                    : "Payouts will be transferred to this account. Ensure details are accurate."
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Account Holder Name"
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHolderName: e.target.value })
                  }
                  required
                  disabled={kycLocked}
                />
                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  required
                  disabled={kycLocked}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="IFSC Code"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                  helperText="11-character IFSC"
                  required
                  disabled={kycLocked}
                />
                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  disabled={kycLocked}
                />
              </div>
              <FileUpload
                label="Cancelled Cheque or Bank Proof"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleKycUpload("ADDRESS_PROOF")}
                helperText="Optional proof (PDF, JPG, PNG - Max 5MB)"
                disabled={kycLocked || uploadingDoc === "ADDRESS_PROOF"}
                uploading={uploadingDoc === "ADDRESS_PROOF"}
                uploadedUrl={addressProofUrl}
                error={uploadErrorByType.ADDRESS_PROOF ?? undefined}
              />
            </div>
          </Card>
        )}

        {/* Action bar */}
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-white/80 pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {status === "submitted" && (
            <div className="order-first w-full rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 sm:order-none sm:mr-4 sm:max-w-md">
              <p className="font-medium">Already submitted</p>
              <p className="mt-0.5 text-amber-700">
                Your profile has been submitted and is under review. The &quot;Submit for Approval&quot; button is disabled because you can only submit once. You can still use &quot;Save changes&quot; to update details if needed.
              </p>
            </div>
          )}
          {status === "approved" && (
            <p className="order-first text-sm text-slate-500 sm:order-none sm:mr-auto">
              Storefront fields can be updated; verified KYC and bank details stay locked.
            </p>
          )}
          {status !== "submitted" && status !== "approved" && !profileComplete && missingForSubmit.length > 0 && (
            <div className="order-first w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 sm:order-none sm:mr-4 sm:max-w-md">
              <p className="font-medium">To enable Submit for Approval, complete:</p>
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-slate-600">
                {missingForSubmit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
              <Save className="h-5 w-5" />
              {saving
                ? "Saving…"
                : status === "approved"
                  ? "Update Profile"
                  : status === "submitted"
                    ? "Save changes"
                    : "Save as Draft"}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitForApproval}
              disabled={
                !profileComplete ||
                saving ||
                status === "submitted" ||
                status === "approved"
              }
              title={
                status === "submitted" || status === "approved"
                  ? "Already submitted or approved"
                  : !profileComplete
                    ? `Complete: ${missingForSubmit.join("; ")}`
                    : undefined
              }
            >
              <Send className="h-5 w-5" />
              {saving ? "Submitting…" : "Submit for Approval"}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </DataState>
  );
}