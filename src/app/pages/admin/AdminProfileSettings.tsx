import { User, Lock, Shield, LogOut, Save } from "lucide-react";

export function AdminProfileSettings() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile Settings</h1>
        <p className="text-sm text-gray-700 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Personal Information */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="Admin"
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="User"
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="admin@markethub.com"
                className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+1 234 567 8900"
                className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
              Update Password
            </button>
          </div>
        </div>

        {/* Role & Permissions */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role & Permissions
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Current Role
              </label>
              <div className="px-4 py-3 border-2 border-gray-400 bg-gray-50">
                <span className="inline-flex px-3 py-1 text-sm font-bold border-2 border-gray-400 bg-gray-200">
                  Super Admin
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border-2 border-gray-400 bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 border-2 border-gray-400" />
                  <span className="ml-3 text-sm text-gray-900 font-bold">Manage Sellers</span>
                </label>
                <label className="flex items-center p-3 border-2 border-gray-400 bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 border-2 border-gray-400" />
                  <span className="ml-3 text-sm text-gray-900 font-bold">Manage Products</span>
                </label>
                <label className="flex items-center p-3 border-2 border-gray-400 bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 border-2 border-gray-400" />
                  <span className="ml-3 text-sm text-gray-900 font-bold">Manage Orders</span>
                </label>
                <label className="flex items-center p-3 border-2 border-gray-400 bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 border-2 border-gray-400" />
                  <span className="ml-3 text-sm text-gray-900 font-bold">View Analytics</span>
                </label>
                <label className="flex items-center p-3 border-2 border-gray-400 bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 border-2 border-gray-400" />
                  <span className="ml-3 text-sm text-gray-900 font-bold">Manage Settlements</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Account Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-3 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-2 font-bold">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
