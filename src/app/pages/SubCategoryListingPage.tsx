import { Link } from "../components/Link";
import { ChevronRight, Star, ShoppingCart } from "lucide-react";

export type SubCategoryListingPageProps = {
  categoryName?: string;
  subCategoryName?: string;
};

export function SubCategoryListingPage({ categoryName = "", subCategoryName = "" }: SubCategoryListingPageProps) {
  return (
    <div className="bg-gray-100">
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/category/${categoryName}`} className="hover:text-gray-900 capitalize">{categoryName}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-bold capitalize">{subCategoryName}</span>
        </div>

        {/* Subcategory Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 capitalize">{subCategoryName}</h1>
          <p className="text-sm text-gray-600 mt-2">Showing 32 products</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white border-2 border-gray-400 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border-2 border-gray-400 bg-gray-50 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border-2 border-gray-400 bg-gray-50 text-sm"
                  />
                </div>
              </div>

              {/* Brand */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Brand</h3>
                <div className="space-y-2">
                  {['Brand A', 'Brand B', 'Brand C', 'Brand D'].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="w-4 h-4 border-2 border-gray-400" />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="w-4 h-4 border-2 border-gray-400" />
                      <div className="flex items-center">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-gray-700 text-gray-700" />
                        ))}
                        <span className="ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button */}
              <button className="w-full py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Right Side - Product Grid */}
          <div className="flex-1">
            {/* Sort Dropdown */}
            <div className="flex justify-end mb-6">
              <select className="px-4 py-2 border-2 border-gray-400 bg-white text-sm font-bold">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Best Rating</option>
              </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="bg-white border-2 border-gray-400">
                  <Link href={`/product/${index + 1}`}>
                    <div className="aspect-square bg-gray-300 flex items-center justify-center border-b-2 border-gray-400">
                      <span className="text-gray-600 text-sm">PRODUCT IMAGE</span>
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Product Name {index + 1}</h3>
                    <p className="text-sm text-gray-600 mb-2">Brand Name</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gray-700 text-gray-700" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">(4.5)</span>
                    </div>
                    
                    <p className="text-lg font-bold text-gray-900 mb-3">$99.99</p>
                    
                    <button className="w-full py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
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
