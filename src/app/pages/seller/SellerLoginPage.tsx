import { Link } from "../../components/Link";
import { User, Lock, Store } from "lucide-react";

export function SellerLoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-700 border-2 border-gray-800 flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MarketHub Seller Center</h1>
          <p className="text-sm text-gray-700">Login to manage your store</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-gray-400 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Seller Login</h2>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="seller@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 border-2 border-gray-400" />
                <span className="ml-2 text-gray-700">Remember me</span>
              </label>
              <Link href="/seller/forgot-password" className="text-gray-700 hover:text-gray-900 underline">
                Forgot password?
              </Link>
            </div>

            <Link
              href="/seller"
              className="block w-full py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold text-center"
            >
              Login to Seller Center
            </Link>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-gray-300 text-center">
            <p className="text-sm text-gray-700">
              New to MarketHub? {" "}
              <Link href="/seller/register" className="font-bold text-gray-900 underline hover:text-gray-700">
                Register as Seller
              </Link>
            </p>
          </div>
        </div>

        {/* Customer Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            Are you a customer? {" "}
            <Link href="/login" className="font-bold text-gray-900 underline hover:text-gray-700">
              Customer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
