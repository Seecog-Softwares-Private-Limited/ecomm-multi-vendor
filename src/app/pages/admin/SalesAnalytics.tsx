import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

const topSellers = [
  { rank: 1, name: "Tech Store", revenue: "$156,800", orders: 1567, growth: "+15.3%" },
  { rank: 2, name: "Fashion Hub", revenue: "$124,500", orders: 1240, growth: "+12.8%" },
  { rank: 3, name: "Electronics Plus", revenue: "$98,900", orders: 989, growth: "+8.5%" },
  { rank: 4, name: "Sports Gear", revenue: "$78,900", orders: 789, growth: "+6.2%" },
  { rank: 5, name: "Home Decor", revenue: "$56,700", orders: 567, growth: "+4.1%" },
];

const topProducts = [
  { rank: 1, name: "Wireless Headphones Pro", category: "Electronics", sales: 2450, revenue: "$734,550" },
  { rank: 2, name: "Smart Watch Series 5", category: "Electronics", sales: 1890, revenue: "$755,610" },
  { rank: 3, name: "Designer Handbag", category: "Fashion", sales: 1234, revenue: "$617,166" },
  { rank: 4, name: "Running Shoes", category: "Sports", sales: 1123, revenue: "$145,990" },
  { rank: 5, name: "Yoga Mat Premium", category: "Sports", sales: 987, revenue: "$49,313" },
];

export function SalesAnalytics() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-sm text-gray-700 mt-1">View detailed sales performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-700" />
          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-2 border-gray-400 p-6">
          <p className="text-sm text-gray-700 font-bold mb-2">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">$2,450,000</h3>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-700" />
            <span className="text-gray-700">+12.5% vs last period</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 p-6">
          <p className="text-sm text-gray-700 font-bold mb-2">Total Orders</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">15,248</h3>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-700" />
            <span className="text-gray-700">+8.2% vs last period</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 p-6">
          <p className="text-sm text-gray-700 font-bold mb-2">Average Order Value</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">$160.68</h3>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-700" />
            <span className="text-gray-700">+3.8% vs last period</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 p-6">
          <p className="text-sm text-gray-700 font-bold mb-2">Conversion Rate</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">3.24%</h3>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="w-4 h-4 text-gray-700" />
            <span className="text-gray-700">-0.5% vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
          <div className="h-80 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-bold">LINE CHART</p>
              <p className="text-xs text-gray-500 mt-1">Monthly Revenue Performance</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Orders Trend</h3>
          <div className="h-80 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-bold">BAR CHART</p>
              <p className="text-xs text-gray-500 mt-1">Monthly Order Volume</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Sellers */}
        <div className="bg-white border-2 border-gray-400">
          <div className="p-6 border-b-2 border-gray-400">
            <h3 className="text-lg font-bold text-gray-900">Top Sellers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200 border-b-2 border-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400">
                {topSellers.map((seller) => (
                  <tr key={seller.rank} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{seller.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{seller.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{seller.revenue}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{seller.orders}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{seller.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border-2 border-gray-400">
          <div className="p-6 border-b-2 border-gray-400">
            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200 border-b-2 border-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400">
                {topProducts.map((product) => (
                  <tr key={product.rank} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{product.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.sales}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
