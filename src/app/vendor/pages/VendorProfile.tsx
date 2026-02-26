"use client";

import { Save, Send, Building, User, CreditCard, FileText, AlertCircle } from "lucide-react";
import { Button, Input, Select, Toggle, FileUpload, Card, Alert } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
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
};

export function VendorProfile() {
  const [formData, setFormData] = React.useState(defaultFormData);
  const [activeSection, setActiveSection] = React.useState("business");
  const [saving, setSaving] = React.useState(false);
  const [uploadingDoc, setUploadingDoc] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState<string | null>(null);
  const [uploadErrorByType, setUploadErrorByType] = React.useState<Record<string, string | null>>({});

  const { data: profile, error, isLoading, refetch } = useApi(() =>
    vendorService.getProfile()
  );

  const status = profile?.status ?? "draft";

  React.useEffect(() => {
    if (!profile) return;
    setFormData({
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
    });
  }, [profile]);

  const sections = [
    { id: "business", label: "Business Details", icon: Building },
    { id: "owner", label: "Owner/Contact", icon: User },
    { id: "bank", label: "Bank Details", icon: CreditCard },
    { id: "documents", label: "Documents", icon: FileText },
  ];

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

  const handleSubmit = async () => {
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
        status: "submitted",
      });
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
        const label = documentType === "PAN" ? "PAN card" : documentType === "GST_CERTIFICATE" ? "GST certificate" : "Cancelled cheque / bank proof";
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

  const addressProofUrl = profile?.documents?.find((d) => d.documentType === "ADDRESS_PROOF")?.fileUrl ?? null;
  const panUrl = profile?.documents?.find((d) => d.documentType === "PAN")?.fileUrl ?? null;
  const gstUrl = profile?.documents?.find((d) => d.documentType === "GST_CERTIFICATE")?.fileUrl ?? null;

  return (
    <DataState isLoading={isLoading} error={error} retry={refetch}>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Vendor Profile & KYC</h1>
        <p className="text-[#64748B]">Complete your profile to start selling on Indovypar</p>
      </div>

      {/* Status Alert */}
      {status === "submitted" && (
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
          message="You can update your business or contact details below and click Update Profile to save changes."
        />
      )}

      {/* Success messages */}
      {successMessage && (
        <Alert
          type="info"
          title="Success"
          message={successMessage}
        />
      )}
      {uploadSuccess && (
        <Alert
          type="info"
          title="Document uploaded"
          message={uploadSuccess}
        />
      )}

      {/* Section Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? "bg-[#3B82F6] text-white shadow-lg"
                  : "bg-white text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#3B82F6]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Business Details Section */}
      {activeSection === "business" && (
        <Card title="Business Information">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Vendor Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                helperText="This name will be shown to customers"
                required
              />
              <Input
                label="Legal Business Name"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                helperText="As per official documents"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                required
              />
              <Input
                label="PAN Number"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                helperText="10-character PAN"
                required
              />
            </div>

            <div>
              <div className="mb-4">
                <Toggle
                  checked={formData.gstNotApplicable}
                  onChange={(checked) => setFormData({ ...formData, gstNotApplicable: checked })}
                  label="GST not applicable"
                />
              </div>
              {!formData.gstNotApplicable && (
                <Input
                  label="GSTIN"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  helperText="15-character GST number"
                />
              )}
            </div>

            <div className="border-t-2 border-[#E2E8F0] pt-6">
              <h3 className="text-lg font-bold text-[#1E293B] mb-4">Business Address</h3>
              <div className="space-y-4">
                <Input
                  label="Address Line 1"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  required
                />
                <Input
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                  <Select
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    options={[
                      { value: "Karnataka", label: "Karnataka" },
                      { value: "Maharashtra", label: "Maharashtra" },
                      { value: "Delhi", label: "Delhi" },
                    ]}
                    required
                  />
                  <Input
                    label="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Pickup/Dispatch Pincode"
                  value={formData.pickupPincode}
                  onChange={(e) => setFormData({ ...formData, pickupPincode: e.target.value })}
                  helperText="Pincode from where orders will be dispatched"
                  required
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Owner/Contact Section */}
      {activeSection === "owner" && (
        <Card title="Owner & Contact Information">
          <div className="space-y-6">
            <Input
              label="Owner Full Name"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
                {formData.mobileVerified && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {formData.emailVerified && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bank Details Section */}
      {activeSection === "bank" && (
        <Card title="Bank Account Details">
          <div className="space-y-6">
            <Alert
              type="info"
              message="Payouts will be transferred to this bank account. Ensure details are accurate."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Account Holder Name"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                required
              />
              <Input
                label="Account Number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="IFSC Code"
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                helperText="11-character IFSC code"
                required
              />
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                disabled
              />
            </div>
            <FileUpload
              label="Cancelled Cheque or Bank Proof"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleKycUpload("ADDRESS_PROOF")}
              helperText="Upload scanned copy (PDF, JPG, PNG - Max 5MB)"
              disabled={uploadingDoc === "ADDRESS_PROOF"}
              uploading={uploadingDoc === "ADDRESS_PROOF"}
              uploadedUrl={addressProofUrl}
              error={uploadErrorByType.ADDRESS_PROOF ?? undefined}
            />
          </div>
        </Card>
      )}

      {/* Documents Section */}
      {activeSection === "documents" && (
        <Card title="KYC Documents">
          <div className="space-y-6">
            <Alert
              type="info"
              message="All documents must be clear and legible. Supported formats: PDF, JPG, PNG (Max 5MB each)"
            />
            <FileUpload
              label="PAN Card (Required)"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleKycUpload("PAN")}
              helperText="Upload PAN card image or PDF"
              disabled={uploadingDoc === "PAN"}
              uploading={uploadingDoc === "PAN"}
              uploadedUrl={panUrl}
              error={uploadErrorByType.PAN ?? undefined}
            />
            {!formData.gstNotApplicable && (
              <FileUpload
                label="GST Certificate (Optional)"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleKycUpload("GST_CERTIFICATE")}
                helperText="Upload GST registration certificate"
                disabled={uploadingDoc === "GST_CERTIFICATE"}
                uploading={uploadingDoc === "GST_CERTIFICATE"}
                uploadedUrl={gstUrl}
                error={uploadErrorByType.GST_CERTIFICATE ?? undefined}
              />
            )}
            <FileUpload
              label="Cancelled Cheque or Bank Statement (Required)"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleKycUpload("ADDRESS_PROOF")}
              helperText="Upload cancelled cheque or recent bank statement"
              disabled={uploadingDoc === "ADDRESS_PROOF"}
              uploading={uploadingDoc === "ADDRESS_PROOF"}
              uploadedUrl={addressProofUrl}
              error={uploadErrorByType.ADDRESS_PROOF ?? undefined}
            />
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-[#E2E8F0]">
        <Button
          variant="secondary"
          onClick={handleSaveDraft}
          disabled={saving}
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving…" : status === "approved" ? "Update Profile" : status === "submitted" ? "Save changes" : "Save as Draft"}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={saving || status === "submitted" || status === "approved"}
        >
          <Send className="w-5 h-5" />
          {saving ? "Submitting…" : "Submit for Approval"}
        </Button>
      </div>
    </div>
    </DataState>
  );
}
