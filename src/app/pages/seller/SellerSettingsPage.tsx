"use client";

import { Save, User, Store, MapPin, CreditCard, Bell, Lock } from "lucide-react";
import * as React from "react";

export function SellerSettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "store", name: "Store Info", icon: Store },
    { id: "address", name: "Business Address", icon: MapPin },
    { id: "payment", name: "Payment", icon: CreditCard },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Lock },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm text-gray-700">Manage your seller account settings</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white border-2 border-gray-400 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-2 ${
                    activeTab === tab.id
                      ? "border-gray-800 bg-gray-200"
                      : "border-transparent hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-900">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white border-2 border-gray-400 p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Smith"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john@techstore.com"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <button className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

            {/* Store Info Tab */}
            {activeTab === "store" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Store Information</h2>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Store Name</label>
                  <input
                    type="text"
                    defaultValue="Tech Store Pro"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Store Description</label>
                  <textarea
                    rows={4}
                    defaultValue="Your one-stop shop for premium tech products and accessories."
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Store URL</label>
                  <input
                    type="text"
                    defaultValue="tech-store-pro"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                  <p className="text-xs text-gray-600 mt-1">marketplace.com/store/tech-store-pro</p>
                </div>

                <button className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

            {/* Business Address Tab */}
            {activeTab === "address" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Business Address</h2>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    defaultValue="123 Business Street"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Suite, Unit, etc. (optional)"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">City</label>
                    <input
                      type="text"
                      defaultValue="New York"
                      className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">State</label>
                    <input
                      type="text"
                      defaultValue="NY"
                      className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      defaultValue="10001"
                      className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Country</label>
                    <select className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600">
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>

                <div className="p-4 border-2 border-gray-400 bg-gray-50">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold">Current Payment Method:</span>
                  </p>
                  <p className="text-sm text-gray-900">Bank Account ending in ****4567</p>
                  <p className="text-xs text-gray-600 mt-1">Last updated: Jan 15, 2026</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Enter bank name"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Routing Number</label>
                  <input
                    type="text"
                    placeholder="Enter routing number"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <button className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                  <Save className="w-4 h-4" />
                  <span>Update Payment Method</span>
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-5 h-5 border-2 border-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">New Orders</p>
                      <p className="text-sm text-gray-600">Get notified when you receive new orders</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-5 h-5 border-2 border-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-600">Receive alerts when products are low in stock</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 border-2 border-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">Customer Messages</p>
                      <p className="text-sm text-gray-600">Get notified about customer inquiries</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-5 h-5 border-2 border-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">Payment Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about payments and settlements</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 border-2 border-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">Marketing Updates</p>
                      <p className="text-sm text-gray-600">Get tips and updates to grow your business</p>
                    </div>
                  </label>
                </div>

                <button className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Security Settings</h2>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <button className="px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-gray-300">
                  <h3 className="font-bold text-gray-900 mb-3">Two-Factor Authentication</h3>
                  <div className="p-4 border-2 border-gray-400 bg-gray-50">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-bold">Status:</span> Disabled
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button className="px-6 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
