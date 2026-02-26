import { Link } from "./Link";

export function Footer() {
  return (
    <footer className="bg-white border-t-2 border-gray-300 mt-12">
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-gray-900">About Us</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Careers</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Press</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/category/electronics" className="hover:text-gray-900">Electronics</Link></li>
              <li><Link href="/category/fashion" className="hover:text-gray-900">Fashion</Link></li>
              <li><Link href="/category/home" className="hover:text-gray-900">Home & Living</Link></li>
              <li><Link href="/category/sports" className="hover:text-gray-900">Sports</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Customer Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-gray-900">Help Center</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Track Order</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Returns</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Follow Us</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-gray-900">Facebook</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Instagram</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Twitter</Link></li>
              <li><Link href="#" className="hover:text-gray-900">YouTube</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>© 2026 E-Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
