"use client";

import {
  Save,
  Send,
  Building,
  CreditCard,
  FileText,
  CheckCircle,
  AlertTriangle,
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

const defaultFormData = {
  displayName: "",
  legalName: "",
  businessType: "company",
  gstin: "",
  gstNotApplicable: false,
  pan: "",
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
  const [uploadSuccess, setUploadSuccess] = React.useState<string | null>(null);
  const [uploadErrorByType, setUploadErrorByType] = React.useState<Record<string, string | null>>({});

  const { data: profile, error, isLoading, refetch } = useApi(() =>
    vendorService.getProfile()
  );

  const status = profile?.status ?? "draft";

  // Only sync profile → formData on initial load, not after refetch (so upload/category change don't wipe unsaved fields)
  const hasSyncedProfileRef = React.useRef(false);
  React.useEffect(() => {
    if (!profile) {
      hasSyncedProfileRef.current = false;
      return;
    }
    if (hasSyncedProfileRef.current) return;
    hasSyncedProfileRef.current = true;
    setFormData((prev) => ({
      ...prev,
      displayName: profile.business.displayName,
      legalName: profile.business.legalName,
      businessType: profile.business.businessType,
      gstin: profile.business.gstin,
      gstNotApplicable: profile.business.gstNotApplicable,
      pan: profile.business.pan,
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
    }));
  }, [profile]);

  React.useEffect(() => {
    vendorService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  React.useEffect(() => {
    const id = formData.primaryCategoryId || profile?.primaryCategoryId;
    if (!id) {
      setCategoryDocRequirements([]);
      return;
    }
    vendorService
      .getCategoryDocumentRequirements(id)
      .then(setCategoryDocRequirements)
      .catch(() => setCategoryDocRequirements([]));
  }, [formData.primaryCategoryId, profile?.primaryCategoryId]);

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

  const handleSaveDraft = async () => {
    setSaving(true);
    setSuccessMessage(null);
    try {
      await vendorService.updateProfile({
        business: {
          displayName: formData.displayName,
          legalName: formData.legalName,
          businessType: formData.businessType,
          pan: formData.pan,
          gstin: formData.gstin,
          gstNotApplicable: formData.gstNotApplicable,
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
        primaryCategoryId: formData.primaryCategoryId || null,
        status: "draft",
      });
      await refetch();
      setSuccessMessage("Draft saved successfully.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save draft";
      setSuccessMessage(null);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setSaving(true);
    setSuccessMessage(null);
    try {
      await vendorService.submitForApproval();
      await refetch();
      setSuccessMessage("Profile submitted for approval.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit for approval";
      setSuccessMessage(null);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleKycUpload = React.useCallback(
    (documentType: "PAN" | "GST_CERTIFICATE" | "ADDRESS_PROOF") => async (file: File | null) => {
      if (!file) return;
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
    [refetch]
  );

  const panUrl = profile?.documents?.find((d) => d.documentType === "PAN")?.fileUrl ?? null;
  const gstUrl =
    profile?.documents?.find((d) => d.documentType === "GST_CERTIFICATE")?.fileUrl ?? null;
  const addressProofUrl =
    profile?.documents?.find((d) => d.documentType === "ADDRESS_PROOF")?.fileUrl ?? null;

  const handleVendorDocUpload = React.useCallback(
    (documentName: string) => async (file: File | null) => {
      if (!file) return;
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
    [refetch]
  );

  const handlePrimaryCategoryChange = async (categoryId: string) => {
    setFormData((prev) => ({ ...prev, primaryCategoryId: categoryId }));
    try {
      await vendorService.updateProfile({ primaryCategoryId: categoryId || null });
      await refetch();
    } catch {
      // revert on error
      setFormData((prev) => ({ ...prev, primaryCategoryId: formData.primaryCategoryId }));
    }
  };

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
              Complete all tabs below to enable Submit for Approval.
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
            message="You can update your details below and click Update Profile to save changes."
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
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="PAN Number"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  helperText="10-character PAN"
                  required
                />
                <div>
                  <Toggle
                    checked={formData.gstNotApplicable}
                    onChange={(checked) =>
                      setFormData({ ...formData, gstNotApplicable: checked })
                    }
                    label="GST not applicable"
                  />
                  {!formData.gstNotApplicable && (
                    <Input
                      label="GST Number"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      helperText="15-character GSTIN"
                      required
                    />
                  )}
                </div>
              </div>
              <Select
                label="Business Type"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                options={[
                  { value: "individual", label: "Individual" },
                  { value: "proprietor", label: "Proprietorship" },
                  { value: "partnership", label: "Partnership" },
                  { value: "company", label: "Company" },
                ]}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Primary Category</label>
                <select
                  value={formData.primaryCategoryId}
                  onChange={(e) => handlePrimaryCategoryChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select category (optional)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">Used for category-specific document requirements</p>
              </div>
              <div className="border-t border-slate-200 pt-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Owner / Contact</h3>
                <div className="space-y-4">
                  <Input
                    label="Owner Full Name"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <Alert
                type="info"
                message="Upload clear, legible documents. PDF, JPG, PNG (Max 5MB each)."
              />
              <FileUpload
                label="PAN Card Image (Required)"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleKycUpload("PAN")}
                helperText="Upload PAN card image or PDF"
                disabled={uploadingDoc === "PAN"}
                uploading={uploadingDoc === "PAN"}
                uploadedUrl={panUrl}
                error={uploadErrorByType.PAN ?? undefined}
              />
              <FileUpload
                label="GST Certificate (Required)"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleKycUpload("GST_CERTIFICATE")}
                helperText="Upload GST registration certificate"
                disabled={uploadingDoc === "GST_CERTIFICATE"}
                uploading={uploadingDoc === "GST_CERTIFICATE"}
                uploadedUrl={gstUrl}
                error={uploadErrorByType.GST_CERTIFICATE ?? undefined}
              />
              <div className="border-t border-slate-200 pt-8">
                <h3 className="mb-1 text-lg font-semibold text-slate-900">Additional documents (by category)</h3>
                <p className="mb-4 text-sm text-slate-500">
                  Based on your Primary Category. Documents marked <strong>Required</strong> must be uploaded to complete your profile.
                </p>
                {!formData.primaryCategoryId && !profile?.primaryCategoryId ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    Select a <strong>Primary Category</strong> in the Business Info tab to see optional documents for your category.
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
                        disabled={uploadingVendorDoc === doc.documentName}
                        uploading={uploadingVendorDoc === doc.documentName}
                        uploadedUrl={profile?.vendorDocuments?.find((d) => d.documentName === doc.documentName)?.documentUrl}
                        error={uploadErrorByType[doc.documentName] ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "bank_details" && (
          <Card title="Bank Details">
            <div className="space-y-6">
              <Alert
                type="info"
                message="Payouts will be transferred to this account. Ensure details are accurate."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Account Holder Name"
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHolderName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="IFSC Code"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                  helperText="11-character IFSC"
                  required
                />
                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </div>
              <FileUpload
                label="Cancelled Cheque or Bank Proof"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleKycUpload("ADDRESS_PROOF")}
                helperText="Optional proof (PDF, JPG, PNG - Max 5MB)"
                disabled={uploadingDoc === "ADDRESS_PROOF"}
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
              Profile is approved. Use Save changes to update details.
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
