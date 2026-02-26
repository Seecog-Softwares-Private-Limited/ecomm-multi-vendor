"use client";

import { Link } from "../components/Link";
import {
  Heart, Share2, Star, MapPin, RotateCcw, Package,
  ChevronRight, ChevronLeft, CheckCircle, X, ThumbsUp,
  Camera, ShieldCheck, TrendingUp, MessageCircle, Info
} from "lucide-react";
import * as React from "react";

const defaultProductImages = ["IMAGE 1", "IMAGE 2", "IMAGE 3", "IMAGE 4", "IMAGE 5"];
const defaultReviews = [
  { id: 1, user: "John D.", rating: 5, date: "2026-02-15", comment: "Excellent product! Works perfectly as described. Highly recommended.", verified: true, helpful: 45, images: 3 },
  { id: 2, user: "Sarah M.", rating: 4, date: "2026-02-10", comment: "Good quality, fast delivery. Minor packaging issue but product is great.", verified: true, helpful: 23, images: 2 },
  { id: 3, user: "Mike R.", rating: 5, date: "2026-02-05", comment: "Best purchase ever! Will buy again.", verified: true, helpful: 67, images: 0 },
  { id: 4, user: "Emma W.", rating: 3, date: "2026-01-28", comment: "Product is okay, expected better quality for the price.", verified: false, helpful: 12, images: 1 },
];

const defaultQuestions = [
  { id: 1, question: "Is this product compatible with iPhone 15?", answer: "Yes, it works with all iPhone models from 12 onwards.", askedBy: "User123", answeredBy: "Seller", helpful: 34, date: "2026-02-12" },
  { id: 2, question: "What is the warranty period?", answer: "This product comes with 1 year manufacturer warranty.", askedBy: "Buyer456", answeredBy: "Seller", helpful: 28, date: "2026-02-10" },
  { id: 3, question: "Does it come with a charging cable?", answer: "Yes, USB-C cable included in the box.", askedBy: "Customer789", answeredBy: "Seller", helpful: 45, date: "2026-02-08" },
];

const defaultSpecifications = [
  { label: "Brand", value: "TechPro" },
  { label: "Model Number", value: "TP-WH-2024-PRO" },
  { label: "Color", value: "Black" },
  { label: "Connectivity", value: "Bluetooth 5.3, 3.5mm Jack" },
  { label: "Battery Life", value: "Up to 40 hours" },
  { label: "Weight", value: "250 grams" },
  { label: "Warranty", value: "1 Year Manufacturer Warranty" },
  { label: "In the Box", value: "Headphones, USB Cable, User Manual, Carry Case" },
];

export type ProductDetailPageEnhancedProps = {
  productId?: string;
  productImages?: string[];
  reviews?: Array<{ id: string; user: string; rating: number; date: string; comment: string; verified: boolean; helpful: number; images: number }>;
  questions?: Array<{ id: string; question: string; answer: string; askedBy: string; answeredBy: string; helpful: number; date: string }>;
  specifications?: Array<{ label: string; value: string }>;
  ratingBreakdown?: Array<{ stars: number; count: number; percentage: number }>;
  avgRating?: number;
  totalReviews?: number;
  productStock?: number;
};

export function ProductDetailPageEnhanced({
  productId = "",
  productImages = defaultProductImages,
  reviews = defaultReviews,
  questions = defaultQuestions,
  specifications = defaultSpecifications,
  ratingBreakdown = [
    { stars: 5, count: 234, percentage: 65 },
    { stars: 4, count: 89, percentage: 25 },
    { stars: 3, count: 23, percentage: 6 },
    { stars: 2, count: 10, percentage: 3 },
    { stars: 1, count: 4, percentage: 1 },
  ],
  avgRating = 4.5,
  totalReviews: totalReviewsProp = 360,
  productStock = 45,
}: ProductDetailPageEnhancedProps) {
  const [currentImage, setCurrentImage] = React.useState(0);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [showQuestionModal, setShowQuestionModal] = React.useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = React.useState<number | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState("Black");
  const [pincode, setPincode] = React.useState("");
  const [deliveryInfo, setDeliveryInfo] = React.useState<any>(null);
  const [showToast, setShowToast] = React.useState(false);

  const stockStatus = productStock > 20 ? 'in-stock' : productStock > 0 ? 'low-stock' : 'out-of-stock';
  const totalReviews = totalReviewsProp;

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo({
        available: true,
        estimatedDays: "2-3 business days",
        codAvailable: true,
        returnable: true,
        returnWindow: "7 days",
      });
    }
  };

  const handleAddToCart = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filteredReviews = selectedRatingFilter 
    ? reviews.filter(r => r.rating === selectedRatingFilter)
    : reviews;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b-2 border-gray-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/category/electronics" className="hover:text-gray-900">Electronics</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-bold truncate">Wireless Headphones Pro</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-400 p-4 sticky top-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-300 border-2 border-gray-400 flex items-center justify-center mb-4 relative">
                <span className="text-gray-600">{productImages[currentImage]}</span>
                
                {/* Wishlist & Share */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 bg-white border-2 border-gray-400 hover:bg-gray-100"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-gray-700' : ''} text-gray-700`} />
                  </button>
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="p-2 bg-white border-2 border-gray-400 hover:bg-gray-100"
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-square bg-gray-300 border-2 ${currentImage === idx ? 'border-gray-800' : 'border-gray-400'} hover:border-gray-600 flex items-center justify-center`}
                  >
                    <span className="text-xs text-gray-600">IMG</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Product Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Product Title & Rating */}
            <div className="bg-white border-2 border-gray-400 p-4 md:p-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Wireless Headphones Pro - Premium Sound Quality with Active Noise Cancellation
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-200 border-2 border-gray-400">
                  <span className="text-lg font-bold text-gray-900">{avgRating}</span>
                  <Star className="w-4 h-4 fill-gray-700 text-gray-700" />
                </div>
                <span className="text-sm text-gray-700 font-bold">{totalReviews} ratings & 234 reviews</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">$299.99</span>
                  <span className="text-xl text-gray-600 line-through">$599.99</span>
                  <span className="px-2 py-1 bg-gray-800 border-2 border-gray-900 text-white text-sm font-bold">50% OFF</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
              </div>

              {/* EMI Option */}
              <div className="p-3 border-2 border-gray-400 bg-gray-50 mb-4">
                <p className="text-sm text-gray-900">
                  <span className="font-bold">EMI</span> starting from $50/month. 
                  <button className="ml-2 text-gray-700 underline">View plans</button>
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {stockStatus === 'in-stock' && (
                  <div className="flex items-center gap-2 text-gray-900">
                    <CheckCircle className="w-5 h-5 text-gray-700" />
                    <span className="font-bold">In Stock</span>
                  </div>
                )}
                {stockStatus === 'low-stock' && (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Info className="w-5 h-5 text-gray-700" />
                    <span className="font-bold">Only {productStock} left in stock - Order soon!</span>
                  </div>
                )}
                {stockStatus === 'out-of-stock' && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <X className="w-5 h-5" />
                    <span className="font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Variant Selection */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">Color:</label>
                <div className="flex gap-2">
                  {["Black", "White", "Blue"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedVariant(color)}
                      className={`px-4 py-2 border-2 ${selectedVariant === color ? 'border-gray-800 bg-gray-200' : 'border-gray-400 bg-white'} hover:bg-gray-100 font-bold`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border-2 border-gray-400 bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-10 h-10 border-2 border-gray-400 bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">(Max 10 per order)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
                >
                  Add to Cart
                </button>
                <Link
                  href="/checkout"
                  className="flex-1 py-3 bg-white text-gray-900 border-2 border-gray-400 hover:bg-gray-100 font-bold text-center"
                >
                  Buy Now
                </Link>
              </div>
            </div>

            {/* Delivery & Returns */}
            <div className="bg-white border-2 border-gray-400 p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Delivery & Returns</h3>
              
              {/* Pincode Checker */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">Check delivery:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                    placeholder="Enter pincode"
                    className="flex-1 px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                  <button
                    onClick={checkDelivery}
                    className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
                  >
                    Check
                  </button>
                </div>
              </div>

              {deliveryInfo && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Package className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Delivery by {deliveryInfo.estimatedDays}</p>
                      <p className="text-gray-600">Standard delivery to {pincode}</p>
                    </div>
                  </div>
                  {deliveryInfo.codAvailable && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Cash on Delivery available</p>
                    </div>
                  )}
                  {deliveryInfo.returnable && (
                    <div className="flex items-start gap-2">
                      <RotateCcw className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-900">{deliveryInfo.returnWindow} Easy Returns</p>
                        <p className="text-gray-600">Replacement or refund available</p>
                        <p className="text-gray-600">Refund processed in 5-7 business days</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seller Information */}
            <div className="bg-white border-2 border-gray-400 p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Seller Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Tech Store Pro</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 border border-gray-400">
                        <span className="text-sm font-bold text-gray-900">4.7</span>
                        <Star className="w-3 h-3 fill-gray-700 text-gray-700" />
                      </div>
                      <span className="text-sm text-gray-600">Seller Rating</span>
                    </div>
                  </div>
                  <Link
                    href="/seller/tech-store-pro"
                    className="px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 text-sm font-bold"
                  >
                    View Store
                  </Link>
                </div>

                <div className="pt-3 border-t-2 border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Total Sales</span>
                    <span className="text-sm font-bold text-gray-900">12,456 products sold</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Response Time</span>
                    <span className="text-sm font-bold text-gray-900">Within 24 hours</span>
                  </div>
                </div>

                <button className="w-full py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 text-sm font-bold">
                  Contact Seller
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Highlights & Offers */}
          <div className="lg:col-span-1 space-y-4">
            {/* Key Highlights */}
            <div className="bg-white border-2 border-gray-400 p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700" />
                  <span>Active Noise Cancellation (ANC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700" />
                  <span>40 Hours Playtime</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700" />
                  <span>Bluetooth 5.3 Connectivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700" />
                  <span>Premium Sound Quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700" />
                  <span>Comfortable Over-Ear Design</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700" />
                  <span>Foldable & Portable</span>
                </li>
              </ul>
            </div>

            {/* Available Offers */}
            <div className="bg-white border-2 border-gray-400 p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Available Offers</h3>
              <div className="space-y-3">
                <div className="p-3 border-2 border-gray-400 bg-gray-50">
                  <p className="text-sm font-bold text-gray-900 mb-1">Bank Offer</p>
                  <p className="text-sm text-gray-700">10% instant discount on HDFC Bank Credit Cards</p>
                </div>
                <div className="p-3 border-2 border-gray-400 bg-gray-50">
                  <p className="text-sm font-bold text-gray-900 mb-1">No Cost EMI</p>
                  <p className="text-sm text-gray-700">No Cost EMI available on orders above $200</p>
                </div>
                <div className="p-3 border-2 border-gray-400 bg-gray-50">
                  <p className="text-sm font-bold text-gray-900 mb-1">Cashback Offer</p>
                  <p className="text-sm text-gray-700">Get $20 cashback on first purchase</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-white border-2 border-gray-400 p-4 md:p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Product Specifications</h3>
          <div className="grid md:grid-cols-2 gap-x-8">
            {specifications.map((spec, idx) => (
              <div key={idx} className={`py-3 flex ${idx < specifications.length - 1 ? 'border-b-2 border-gray-300' : ''}`}>
                <span className="w-1/3 text-sm font-bold text-gray-700">{spec.label}</span>
                <span className="w-2/3 text-sm text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="bg-white border-2 border-gray-400 p-4 md:p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Ratings & Reviews</h3>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
            >
              Write Review
            </button>
          </div>

          {/* Rating Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-gray-300">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{avgRating}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-gray-700 text-gray-700" />
                ))}
              </div>
              <p className="text-sm text-gray-700">{totalReviews} ratings & reviews</p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {ratingBreakdown.map((rating) => (
                <button
                  key={rating.stars}
                  onClick={() => setSelectedRatingFilter(selectedRatingFilter === rating.stars ? null : rating.stars)}
                  className={`w-full flex items-center gap-3 p-2 ${selectedRatingFilter === rating.stars ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span className="text-sm font-bold text-gray-900 w-6">{rating.stars}★</span>
                  <div className="flex-1 h-2 bg-gray-300 border border-gray-400">
                    <div className="h-full bg-gray-700" style={{ width: `${rating.percentage}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-700 w-12">{rating.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Review Filters */}
          <div className="flex items-center gap-3 mb-6 overflow-x-auto">
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">Filter:</span>
            <button
              onClick={() => setSelectedRatingFilter(null)}
              className={`px-3 py-1 text-sm border-2 ${!selectedRatingFilter ? 'border-gray-800 bg-gray-200' : 'border-gray-400 bg-white'} font-bold whitespace-nowrap`}
            >
              All Reviews
            </button>
            <button className="px-3 py-1 text-sm border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold whitespace-nowrap">
              With Photos
            </button>
            <button className="px-3 py-1 text-sm border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold whitespace-nowrap">
              Verified Purchase
            </button>
            <select className="px-3 py-1 text-sm border-2 border-gray-400 bg-white font-bold">
              <option>Most Helpful</option>
              <option>Most Recent</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="pb-6 border-b-2 border-gray-300 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 border border-gray-400">
                        <span className="text-sm font-bold text-gray-900">{review.rating}</span>
                        <Star className="w-3 h-3 fill-gray-700 text-gray-700" />
                      </div>
                      <span className="font-bold text-gray-900">{review.user}</span>
                      {review.verified && (
                        <div className="flex items-center gap-1 px-2 py-0.5 border border-gray-400 bg-gray-50">
                          <ShieldCheck className="w-3 h-3 text-gray-700" />
                          <span className="text-xs text-gray-700">Verified Purchase</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap ml-4">{review.date}</span>
                </div>

                {review.images > 0 && (
                  <div className="flex gap-2 mb-3">
                    {Array(review.images).fill(0).map((_, idx) => (
                      <div key={idx} className="w-16 h-16 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-gray-600" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions & Answers */}
        <div className="bg-white border-2 border-gray-400 p-4 md:p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Questions & Answers</h3>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold"
            >
              Ask Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((qa) => (
              <div key={qa.id} className="pb-6 border-b-2 border-gray-300 last:border-0">
                <div className="mb-3">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">Q: {qa.question}</p>
                      <p className="text-xs text-gray-600">Asked by {qa.askedBy} on {qa.date}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-7 p-3 border-l-4 border-gray-400 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-700 text-white text-xs font-bold">SELLER</span>
                    <span className="text-xs text-gray-600">Answered</span>
                  </div>
                  <p className="text-sm text-gray-900">{qa.answer}</p>
                </div>

                <div className="ml-7 mt-2">
                  <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({qa.helpful})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 border-2 border-gray-900 z-50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Added to cart successfully!</span>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Share Product</h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["WhatsApp", "Facebook", "Twitter", "Email", "Copy Link", "More"].map((option) => (
                <button key={option} className="p-4 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold text-gray-900">
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border-2 border-gray-400 max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)}>
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Your Rating:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="p-2 border-2 border-gray-400 hover:bg-gray-100">
                      <Star className="w-6 h-6 text-gray-700" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Your Review:</label>
                <textarea
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Upload Photos (Optional):</label>
                <div className="flex gap-2">
                  <button className="w-24 h-24 border-2 border-gray-400 bg-gray-100 hover:bg-gray-200 flex flex-col items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">Add Photo</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowReviewModal(false)} className="flex-1 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                  Cancel
                </button>
                <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Ask a Question</h3>
              <button onClick={() => setShowQuestionModal(false)}>
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Your Question:</label>
                <textarea
                  rows={4}
                  placeholder="What would you like to know about this product?"
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowQuestionModal(false)} className="flex-1 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                  Cancel
                </button>
                <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                  Submit Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
