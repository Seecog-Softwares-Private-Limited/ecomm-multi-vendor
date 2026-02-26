"use client";

import { Save, Send, Building, User, CreditCard, FileText, AlertCircle } from "lucide-react";
import { Button, Input, Select, Toggle, FileUpload, Card, Alert } from "../components/UIComponents";
import * as React from "react";

export function VendorProfile() {
  const [formData, setFormData] = React.useState({
    // Business Details
    displayName: "Tech Store India",
    legalName: "Tech Store India Private Limited",
    businessType: "company",
    gstin: "29ABCDE1234F1Z5",
    gstNotApplicable: false,
    pan: "ABCDE1234F",
    addressLine1: "123, MG Road",
    addressLine2: "Near City Center",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    pickupPincode: "560001",
    // Owner Details
    ownerName: "Rahul Sharma",
    mobile: "+91 9876543210",
    mobileVerified: true,
    email: "rahul@techstore.com",
    emailVerified: true,
    // Bank Details
    accountHolderName: "Tech Store India Pvt Ltd",
    accountNumber: "1234567890123456",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
  });

  const [activeSection, setActiveSection] = React.useState("business");
  const [status, setStatus] = React.useState<"draft" | "submitted" | "approved">("draft");

  const sections = [
    { id: "business", label: "Business Details", icon: Building },
    { id: "owner", label: "Owner/Contact", icon: User },
    { id: "bank", label: "Bank Details", icon: CreditCard },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  const handleSubmit = () => {
    // Submit for approval logic
    setStatus("submitted");
    alert("Profile submitted for approval!");
  };

  const handleSaveDraft = () => {
    alert("Draft saved successfully!");
  };

  return (
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
              onChange={(file) => console.log(file)}
              helperText="Upload scanned copy (PDF, JPG, PNG - Max 5MB)"
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
              onChange={(file) => console.log(file)}
              helperText="Upload PAN card image or PDF"
            />
            {!formData.gstNotApplicable && (
              <FileUpload
                label="GST Certificate (Optional)"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => console.log(file)}
                helperText="Upload GST registration certificate"
              />
            )}
            <FileUpload
              label="Cancelled Cheque or Bank Statement (Required)"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(file) => console.log(file)}
              helperText="Upload cancelled cheque or recent bank statement"
            />
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-[#E2E8F0]">
        <Button variant="secondary" onClick={handleSaveDraft} disabled={status === "submitted"}>
          <Save className="w-5 h-5" />
          Save as Draft
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={status === "submitted"}>
          <Send className="w-5 h-5" />
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}
