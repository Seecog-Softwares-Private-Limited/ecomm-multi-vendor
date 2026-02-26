import { Link } from "../components/Link";
import { ChevronRight } from "lucide-react";

export function AddNewAddressPage() {
  return (
    <div className="bg-gray-100">
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/checkout" className="hover:text-gray-900">Checkout</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-bold">Add New Address</span>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-2 border-gray-400 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Address</h1>
            
            <form className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-50 focus:outline-none focus:border-gray-600"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-50 focus:outline-none focus:border-gray-600"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  placeholder="Street address, building name"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-50 focus:outline-none focus:border-gray-600"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-50 focus:outline-none focus:border-gray-600"
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-50 focus:outline-none focus:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Enter state"
                    className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-50 focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="Enter pincode"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-50 focus:outline-none focus:border-gray-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
                >
                  Save Address
                </button>
                <Link
                  href="/checkout"
                  className="flex-1 py-3 bg-white text-gray-900 border-2 border-gray-400 hover:bg-gray-100 text-center font-bold"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
