import { Download, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

const stats = [
  { icon: DollarSign, label: "Total Commission", value: "$245,000" },
  { icon: TrendingUp, label: "Total Payouts", value: "$2,205,000" },
  { icon: Clock, label: "Pending Settlements", value: "$124,500" },
  { icon: CheckCircle, label: "Completed This Month", value: "$89,300" },
];

const settlements = [
  { id: 1, seller: "Tech Store", revenue: "$124,500", commission: "$12,450", payout: "$112,050", status: "Pending", date: "2026-02-20" },
  { id: 2, seller: "Fashion Hub", revenue: "$89,300", commission: "$8,930", payout: "$80,370", status: "Completed", date: "2026-02-15" },
  { id: 3, seller: "Home Decor", revenue: "$56,700", commission: "$5,670", payout: "$51,030", status: "Completed", date: "2026-02-15" },
  { id: 4, seller: "Sports Gear", revenue: "$78,900", commission: "$7,890", payout: "$71,010", status: "Processing", date: "2026-02-18" },
  { id: 5, seller: "Electronics Plus", revenue: "$156,800", commission: "$15,680", payout: "$141,120", status: "Completed", date: "2026-02-15" },
  { id: 6, seller: "Beauty Store", revenue: "$45,600", commission: "$4,560", payout: "$41,040", status: "Pending", date: "2026-02-20" },
];

export function SettlementDashboard() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settlement Dashboard</h1>
          <p className="text-sm text-gray-700 mt-1">Track commission and seller payouts</p>
        </div>
        <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold">
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border-2 border-gray-400 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-700 font-bold">{stat.label}</p>
                <div className="w-10 h-10 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-400 p-6 mb-6">
        <div className="flex gap-4">
          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Completed</option>
          </select>

          <input
            type="date"
            className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
          />

          <input
            type="date"
            className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
          />

          <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Seller Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Commission (10%)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Payout Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Settlement Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {settlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{settlement.seller}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{settlement.revenue}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{settlement.commission}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{settlement.payout}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {settlement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{settlement.date}</td>
                  <td className="px-6 py-4">
                    {settlement.status === 'Pending' && (
                      <button className="px-3 py-1 text-sm border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                        Process
                      </button>
                    )}
                    {settlement.status === 'Completed' && (
                      <button className="px-3 py-1 text-sm border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                        View Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="px-6 py-4 border-t-2 border-gray-400 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700 font-bold">Showing 1 to 6 settlements</p>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Commission</p>
                <p className="text-lg font-bold text-gray-900">$55,180</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Payout</p>
                <p className="text-lg font-bold text-gray-900">$496,620</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
