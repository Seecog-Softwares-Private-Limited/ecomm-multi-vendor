import { Link } from "../../components/Link";
import { Search, Filter, Eye, Ban } from "lucide-react";

const sellers = [
  { id: 1, name: "John Smith", business: "Tech Store", email: "john@techstore.com", phone: "+1 234 567 8901", kyc: "Approved", products: 245, orders: 1240, status: "Active" },
  { id: 2, name: "Sarah Johnson", business: "Fashion Hub", email: "sarah@fashionhub.com", phone: "+1 234 567 8902", kyc: "Pending", products: 156, orders: 890, status: "Active" },
  { id: 3, name: "Mike Wilson", business: "Home Decor", email: "mike@homedecor.com", phone: "+1 234 567 8903", kyc: "Approved", products: 98, orders: 456, status: "Active" },
  { id: 4, name: "Emily Brown", business: "Sports Gear", email: "emily@sportsgear.com", phone: "+1 234 567 8904", kyc: "Rejected", products: 67, orders: 234, status: "Blocked" },
  { id: 5, name: "David Lee", business: "Electronics Plus", email: "david@electronicsplus.com", phone: "+1 234 567 8905", kyc: "Approved", products: 312, orders: 1567, status: "Active" },
  { id: 6, name: "Lisa Anderson", business: "Beauty Store", email: "lisa@beautystore.com", phone: "+1 234 567 8906", kyc: "Pending", products: 189, orders: 678, status: "Active" },
];

export function SellerManagement() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage all sellers and their accounts</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-2 border-gray-400 p-6 mb-6">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search by name, email, or business..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>

          {/* KYC Filter */}
          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All KYC Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>

          {/* Status Filter */}
          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All Status</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>

          <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Seller Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">KYC Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {sellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{seller.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{seller.business}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{seller.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{seller.phone}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {seller.kyc}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{seller.products}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{seller.orders}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/sellers/${seller.id}`}
                        className="p-2 border-2 border-gray-400 hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </Link>
                      <button className="p-2 border-2 border-gray-400 hover:bg-gray-100" title="Block">
                        <Ban className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t-2 border-gray-400 flex items-center justify-between">
          <p className="text-sm text-gray-700 font-bold">Showing 1 to 6 of 1,234 sellers</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Previous</button>
            <button className="px-3 py-1 bg-gray-700 text-white border-2 border-gray-800 text-sm font-bold">1</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">2</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">3</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
