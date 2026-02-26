"use client";

import { Lock, User, CreditCard, Bell, Save } from "lucide-react";
import { Button, Input, Card, Alert, Toggle } from "../components/UIComponents";
import * as React from "react";

export function VendorSettings() {
  const [activeTab, setActiveTab] = React.useState("password");

  // Password settings
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Profile settings
  const [displayName, setDisplayName] = React.useState("Tech Store India");
  const [email, setEmail] = React.useState("tech@store.com");
  const [mobile, setMobile] = React.useState("+91 9876543210");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [smsNotifications, setSmsNotifications] = React.useState(false);
  const [orderNotifications, setOrderNotifications] = React.useState(true);
  const [payoutNotifications, setPayoutNotifications] = React.useState(true);
  const [marketingNotifications, setMarketingNotifications] = React.useState(false);

  const tabs = [
    { id: "password", label: "Change Password", icon: Lock },
    { id: "profile", label: "Profile Info", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password don't match");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdateProfile = () => {
    alert("Profile updated successfully! Changes are subject to admin approval.");
  };

  const handleSaveNotifications = () => {
    alert("Notification preferences saved!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Settings</h1>
        <p className="text-[#64748B]">Manage your account settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#3B82F6] text-white shadow-lg"
                  : "bg-white text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#3B82F6]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <Card title="Change Password">
          <div className="space-y-6">
            <Alert
              type="info"
              message="Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters."
            />

            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 8 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="flex justify-end">
              <Button variant="primary" onClick={handleChangePassword}>
                <Save className="w-5 h-5" />
                Update Password
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Info Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <Alert
            type="warning"
            title="Profile Changes Require Approval"
            message="Changes to your business name, email, or mobile number require admin approval. Your account may be temporarily restricted during the review process."
          />

          <Card title="Business Information">
            <div className="space-y-6">
              <Input
                label="Vendor Display Name"
                placeholder="Your store name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                helperText="This name will be visible to customers"
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Used for important account notifications"
                required
              />

              <Input
                label="Mobile Number"
                type="tel"
                placeholder="+91 9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                helperText="Used for order and payout notifications"
                required
              />

              <div className="flex justify-end">
                <Button variant="primary" onClick={handleUpdateProfile}>
                  <Save className="w-5 h-5" />
                  Update Profile
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Bank Account">
            <Alert
              type="info"
              message="To update your bank account details, please visit the Profile & KYC section. Bank changes require document verification and admin approval."
            />
            <div className="flex justify-start mt-4">
              <Button variant="secondary" onClick={() => (window.location.href = "/vendor/profile")}>
                <CreditCard className="w-5 h-5" />
                Go to Profile & KYC
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card title="Notification Preferences">
          <div className="space-y-6">
            <Alert
              type="info"
              message="Control how you receive notifications about orders, payouts, and updates."
            />

            <div className="space-y-6">
              {/* Notification Channels */}
              <div className="bg-[#F8FAFC] rounded-xl p-6 border-2 border-[#E2E8F0]">
                <h4 className="font-semibold text-[#1E293B] mb-4">Notification Channels</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E293B]">Email Notifications</p>
                      <p className="text-sm text-[#64748B]">Receive notifications via email</p>
                    </div>
                    <Toggle
                      checked={emailNotifications}
                      onChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E293B]">SMS Notifications</p>
                      <p className="text-sm text-[#64748B]">Receive notifications via SMS</p>
                    </div>
                    <Toggle
                      checked={smsNotifications}
                      onChange={setSmsNotifications}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="bg-[#F8FAFC] rounded-xl p-6 border-2 border-[#E2E8F0]">
                <h4 className="font-semibold text-[#1E293B] mb-4">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E293B]">Order Notifications</p>
                      <p className="text-sm text-[#64748B]">
                        New orders, cancellations, and returns
                      </p>
                    </div>
                    <Toggle
                      checked={orderNotifications}
                      onChange={setOrderNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E293B]">Payout Notifications</p>
                      <p className="text-sm text-[#64748B]">Payout processed and bank transfers</p>
                    </div>
                    <Toggle
                      checked={payoutNotifications}
                      onChange={setPayoutNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E293B]">Marketing & Updates</p>
                      <p className="text-sm text-[#64748B]">
                        Promotional offers and platform updates
                      </p>
                    </div>
                    <Toggle
                      checked={marketingNotifications}
                      onChange={setMarketingNotifications}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" onClick={handleSaveNotifications}>
                <Save className="w-5 h-5" />
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Danger Zone */}
      <Card title="Danger Zone">
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="font-semibold text-red-800 mb-2">Deactivate Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Deactivating your account will hide all your products and prevent new orders. You can
              reactivate anytime by contacting support.
            </p>
            <Button variant="danger" size="sm">
              Deactivate Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
