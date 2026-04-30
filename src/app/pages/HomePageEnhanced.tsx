"use client";

import { Link } from "../components/Link";
import { 
  Search, TrendingUp, Clock, Heart, Star, ShoppingCart, 
  ChevronLeft, ChevronRight, MapPin, CheckCircle, 
  Package, RotateCcw, Zap, Shield, Timer
} from "lucide-react";
import * as React from "react";

const flashSaleProducts = [
  { id: 1, name: "Wireless Headphones Pro", price: 299.99, originalPrice: 599.99, discount: 50, stock: 12, rating: 4.5, reviews: 234, image: "HEADPHONES" },
  { id: 2, name: "Smart Watch Series 5", price: 399.99, originalPrice: 699.99, discount: 43, stock: 5, rating: 4.7, reviews: 567, image: "WATCH" },
  { id: 3, name: "Bluetooth Speaker", price: 79.99, originalPrice: 149.99, discount: 47, stock: 23, rating: 4.3, reviews: 145, image: "SPEAKER" },
  { id: 4, name: "Laptop Stand Aluminum", price: 49.99, originalPrice: 89.99, discount: 44, stock: 8, rating: 4.6, reviews: 89, image: "STAND" },
];

const recommendedProducts = [
  { id: 5, name: "Gaming Mouse RGB", price: 59.99, rating: 4.4, reviews: 456, discount: 20, seller: "Tech Store", image: "MOUSE" },
  { id: 6, name: "Mechanical Keyboard", price: 129.99, rating: 4.8, reviews: 789, discount: 15, seller: "Gaming Hub", image: "KEYBOARD" },
  { id: 7, name: "Webcam 4K Pro", price: 149.99, rating: 4.6, reviews: 234, discount: 25, seller: "Electronics Plus", image: "WEBCAM" },
  { id: 8, name: "USB-C Hub 7-in-1", price: 39.99, rating: 4.5, reviews: 123, discount: 0, seller: "Tech Accessories", image: "HUB" },
];

const trendingSearches = ["Wireless headphones", "Smart watch", "Laptop bag", "Phone case", "Bluetooth speaker"];
const categories = [
  { name: "Electronics", count: "2.5K+ products" },
  { name: "Fashion", count: "5.2K+ products" },
  { name: "Home & Living", count: "1.8K+ products" },
  { name: "Sports & Fitness", count: "950+ products" },
  { name: "Books", count: "3.1K+ products" },
  { name: "Beauty", count: "1.2K+ products" },
  { name: "Toys", count: "890+ products" },
  { name: "Automotive", count: "640+ products" },
];

export function HomePageEnhanced() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
  const [pincode, setPincode] = React.useState("");
  const [pincodeChecked, setPincodeChecked] = React.useState(false);
  const [pincodeValid, setPincodeValid] = React.useState(false);
  const [wishlist, setWishlist] = React.useState<number[]>([]);
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = React.useState({ hours: 4, minutes: 23, seconds: 45 });

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const checkPincode = () => {
    setPincodeChecked(true);
    setPincodeValid(pincode.length === 6);
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Quick Admin Link - For Demo Purposes */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm">
          <span>Admin Panel:</span>
          <Link href="/admin/login" className="underline hover:text-blue-200">Admin Login</Link>
          <span>|</span>
          <Link href="/admin" className="underline hover:text-blue-200">Dashboard</Link>
          <span>|</span>
          <Link href="/seller/login" className="underline hover:text-blue-200">Seller Panel</Link>
          <span>|</span>
          <Link href="/pdf-export" className="underline hover:text-blue-200 font-bold">📄 PDF Export</Link>
        </div>
      </div>

      {/* Hero Section with Smart Search */}
      <section className="bg-white border-b-2 border-gray-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-16">
          {/* Smart Search Bar */}
          <div className="max-w-3xl mx-auto mb-8 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchDropdown(searchQuery.length > 0 || true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                placeholder="Search for products, brands, categories..."
                className="w-full px-4 md:px-6 py-3 md:py-4 pr-12 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600 text-sm md:text-base"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-800 border-2 border-gray-800">
                <Search className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-400 z-50 max-h-96 overflow-y-auto">
                {/* Trending Searches */}
                <div className="p-4 border-b-2 border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-700" />
                    <span className="text-xs font-bold text-gray-700 uppercase">Trending Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, idx) => (
                      <button key={idx} className="px-3 py-1 text-xs border-2 border-gray-400 bg-gray-100 hover:bg-gray-200">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                <div className="p-4 border-b-2 border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-700" />
                    <span className="text-xs font-bold text-gray-700 uppercase">Recent Searches</span>
                  </div>
                  <div className="space-y-2">
                    {["Laptop stand", "USB cable", "Mouse pad"].map((term, idx) => (
                      <button key={idx} className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Suggestions */}
                <div className="p-4 border-b-2 border-gray-300">
                  <div className="text-xs font-bold text-gray-700 uppercase mb-3">Product Suggestions</div>
                  <div className="space-y-2">
                    {recommendedProducts.slice(0, 3).map((product) => (
                      <Link key={product.id} href={`/product/${product.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-100">
                        <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-600">IMG</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-600">${product.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Category Suggestions */}
                <div className="p-4">
                  <div className="text-xs font-bold text-gray-700 uppercase mb-3">Categories</div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 4).map((cat) => (
                      <Link key={cat.name} href={`/category/${cat.name.toLowerCase()}`} className="p-2 border-2 border-gray-400 hover:bg-gray-100 text-sm">
                        <p className="font-bold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-600">{cat.count}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hero Banner Slider */}
          <div className="relative bg-gray-300 h-64 md:h-96 border-2 border-gray-400 flex items-center justify-center">
            <span className="text-gray-600 text-sm md:text-lg">HERO BANNER SLIDER</span>
            
            <button className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-800">
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </button>
            <button className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-700 hover:bg-gray-800">
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-700"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Pincode Checker */}
      <section className="bg-white border-b-2 border-gray-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-bold text-gray-900">Check Delivery & COD Availability:</span>
              </div>
              <div className="flex-1 flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setPincodeChecked(false);
                  }}
                  placeholder="Enter pincode"
                  maxLength={6}
                  className="flex-1 px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600 text-sm"
                />
                <button onClick={checkPincode} className="px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold text-sm whitespace-nowrap">
                  Check
                </button>
              </div>
            </div>
            {pincodeChecked && (
              <div className={`mt-3 p-3 border-2 ${pincodeValid ? 'border-gray-400 bg-gray-50' : 'border-gray-400 bg-gray-100'}`}>
                {pincodeValid ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-700" />
                      <span className="text-gray-900">Delivery available to pincode {pincode}</span>
                    </div>
                    <div className="text-gray-700">• Estimated delivery: 2-3 business days</div>
                    <div className="text-gray-700">• Cash on Delivery available</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    Invalid pincode. Please enter a valid 6-digit pincode.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="bg-white border-2 border-gray-400 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Flash Sale</h2>
                <p className="text-xs md:text-sm text-gray-600">Limited time offers - Hurry up!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm font-bold text-gray-700 uppercase">Ends in:</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-gray-700 border-2 border-gray-800 text-white text-center min-w-[48px]">
                  <div className="text-lg md:text-xl font-bold">{String(flashSaleTimeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs">HRS</div>
                </div>
                <div className="text-gray-700 font-bold">:</div>
                <div className="px-3 py-2 bg-gray-700 border-2 border-gray-800 text-white text-center min-w-[48px]">
                  <div className="text-lg md:text-xl font-bold">{String(flashSaleTimeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs">MIN</div>
                </div>
                <div className="text-gray-700 font-bold">:</div>
                <div className="px-3 py-2 bg-gray-700 border-2 border-gray-800 text-white text-center min-w-[48px]">
                  <div className="text-lg md:text-xl font-bold">{String(flashSaleTimeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs">SEC</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flashSaleProducts.map((product) => (
              <div key={product.id} className="relative bg-white border-2 border-gray-400 hover:border-gray-600 transition-colors">
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gray-800 border-2 border-gray-900 text-white text-xs font-bold">
                  {product.discount}% OFF
                </div>
                
                {/* Wishlist Button */}
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white border-2 border-gray-400 hover:bg-gray-100"
                >
                  <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-gray-700' : ''} text-gray-700`} />
                </button>

                <Link href={`/product/${product.id}`} className="block">
                  <div className="aspect-square bg-gray-300 flex items-center justify-center border-b-2 border-gray-400">
                    <span className="text-xs text-gray-600">{product.image}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 mb-1 text-sm line-clamp-2">{product.name}</h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 border border-gray-400">
                        <span className="text-xs font-bold text-gray-900">{product.rating}</span>
                        <Star className="w-3 h-3 fill-gray-700 text-gray-700" />
                      </div>
                      <span className="text-xs text-gray-600">({product.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        <span className="text-sm text-gray-600 line-through">${product.originalPrice}</span>
                      </div>
                    </div>

                    {/* Stock Indicator */}
                    {product.stock < 10 && (
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <Timer className="w-3 h-3" />
                        <span className="font-bold">Only {product.stock} left!</span>
                      </div>
                    )}
                    {product.stock >= 10 && product.stock < 20 && (
                      <div className="px-2 py-1 bg-gray-200 border border-gray-400 text-xs font-bold text-gray-900 inline-block">
                        Selling Fast
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended For You Section */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Recommended For You</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {recommendedProducts.map((product) => (
            <div key={product.id} className="relative bg-white border-2 border-gray-400 hover:border-gray-600 transition-colors">
              {product.discount > 0 && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gray-800 border-2 border-gray-900 text-white text-xs font-bold">
                  {product.discount}% OFF
                </div>
              )}
              
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-2 right-2 z-10 p-2 bg-white border-2 border-gray-400 hover:bg-gray-100"
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-gray-700' : ''} text-gray-700`} />
              </button>

              <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-gray-300 flex items-center justify-center border-b-2 border-gray-400">
                  <span className="text-xs text-gray-600">{product.image}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{product.seller}</p>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 border border-gray-400">
                      <span className="text-xs font-bold text-gray-900">{product.rating}</span>
                      <Star className="w-3 h-3 fill-gray-700 text-gray-700" />
                    </div>
                    <span className="text-xs text-gray-600">({product.reviews})</span>
                  </div>

                  <p className="text-lg font-bold text-gray-900">${product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              href={`/category/${category.name.toLowerCase()}`}
              className="bg-white border-2 border-gray-400 hover:border-gray-600 transition-colors"
            >
              <div className="aspect-square bg-gray-300 flex items-center justify-center border-b-2 border-gray-400">
                <span className="text-xs md:text-sm text-gray-600">IMAGE</span>
              </div>
              <div className="p-3 md:p-4 text-center">
                <h3 className="font-bold text-gray-900 text-sm md:text-base">{category.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{category.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-white border-y-2 border-gray-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 border-2 border-gray-800 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Secure Payment</h3>
              <p className="text-xs text-gray-600">100% secure payment with SSL encryption</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 border-2 border-gray-800 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Fast Delivery</h3>
              <p className="text-xs text-gray-600">Express shipping available nationwide</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 border-2 border-gray-800 flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Easy Returns</h3>
              <p className="text-xs text-gray-600">7-day hassle-free return policy</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 border-2 border-gray-800 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Quality Verified</h3>
              <p className="text-xs text-gray-600">All products quality checked</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
