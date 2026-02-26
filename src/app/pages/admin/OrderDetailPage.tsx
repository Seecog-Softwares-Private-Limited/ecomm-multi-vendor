import { Link } from "../../components/Link";
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock } from "lucide-react";

export type OrderDetailPageTimelineItem = { status: string; date: string; completed: boolean };
export type OrderDetailPageProduct = { id: number; name: string; quantity: number; price: string; total: string };

export type OrderDetailPageProps = {
  orderId?: string;
  timeline?: OrderDetailPageTimelineItem[];
  products?: OrderDetailPageProduct[];
};

const defaultTimeline: OrderDetailPageTimelineItem[] = [
  { status: "Order Placed", date: "Feb 16, 2026 - 10:30 AM", completed: true },
  { status: "Payment Confirmed", date: "Feb 16, 2026 - 10:35 AM", completed: true },
  { status: "Processing", date: "Feb 16, 2026 - 11:00 AM", completed: true },
  { status: "Shipped", date: "Feb 17, 2026 - 9:00 AM", completed: true },
  { status: "Out for Delivery", date: "Feb 18, 2026 - 8:00 AM", completed: false },
  { status: "Delivered", date: "Pending", completed: false },
];

const defaultProducts: OrderDetailPageProduct[] = [
  { id: 1, name: "Wireless Headphones Pro", quantity: 1, price: "$299.99", total: "$299.99" },
  { id: 2, name: "Phone Case", quantity: 2, price: "$19.99", total: "$39.98" },
];

export function OrderDetailPage({ orderId = "", timeline = defaultTimeline, products = defaultProducts }: OrderDetailPageProps) {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Back Button */}
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-gray-900 hover:underline mb-6 font-bold">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-700 mt-1 font-bold">Order ID: #{orderId}</p>
        </div>
        <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
          Override Status
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Summary
            </h2>
            <div className="overflow-x-auto border-2 border-gray-400">
              <table className="w-full">
                <thead className="border-b-2 border-gray-400 bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-400">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.price}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{product.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">John Doe</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">john.doe@example.com</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">+1 234 567 8901</p>
              </div>
            </div>
          </div>

          {/* Seller Details */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seller Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-700">Business Name</label>
                <p className="mt-1 text-gray-900">Tech Store</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">contact@techstore.com</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">+1 234 567 8902</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Info */}
        <div className="col-span-1 space-y-6">
          {/* Payment Info */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Info
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-bold text-gray-900">$339.97</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Shipping</span>
                <span className="font-bold text-gray-900">$9.99</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Tax</span>
                <span className="font-bold text-gray-900">$27.00</span>
              </div>
              <div className="pt-3 border-t-2 border-gray-400 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">$376.96</span>
              </div>
              <div className="pt-3 border-t-2 border-gray-400">
                <label className="text-sm font-bold text-gray-700">Payment Method</label>
                <p className="mt-1 text-gray-900">Credit Card (**** 1234)</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Payment Status</label>
                <span className="block mt-1">
                  <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                    Paid
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="text-sm text-gray-900">
              <p className="font-bold">John Doe</p>
              <p className="mt-2">123 Main Street</p>
              <p>Apartment 4B</p>
              <p>New York, NY 10001</p>
              <p>United States</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Order Timeline
            </h2>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 border-2 ${item.completed ? 'bg-gray-700 border-gray-800' : 'bg-white border-gray-400'}`} />
                    {index < timeline.length - 1 && (
                      <div className={`w-0.5 h-8 ${item.completed ? 'bg-gray-700' : 'bg-gray-400'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.status}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
