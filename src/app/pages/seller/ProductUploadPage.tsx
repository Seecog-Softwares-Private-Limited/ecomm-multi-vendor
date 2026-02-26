"use client";

import { Link } from "../../components/Link";
import { 
  ArrowLeft, Save, Upload, X, Plus, Trash2, 
  Image as ImageIcon, ChevronRight
} from "lucide-react";
import * as React from "react";

const steps = [
  { id: 1, name: "Basic Info", completed: true, active: true },
  { id: 2, name: "Pricing", completed: false, active: false },
  { id: 3, name: "Variants", completed: false, active: false },
  { id: 4, name: "Images", completed: false, active: false },
  { id: 5, name: "Shipping", completed: false, active: false },
  { id: 6, name: "Preview", completed: false, active: false },
];

export function ProductUploadPage() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [variants, setVariants] = React.useState([
    { id: 1, color: "Black", size: "M", stock: 0, sku: "" }
  ]);
  const [images, setImages] = React.useState<number[]>([]);

  const addVariant = () => {
    setVariants([...variants, { 
      id: Date.now(), 
      color: "", 
      size: "", 
      stock: 0, 
      sku: "" 
    }]);
  };

  const removeVariant = (id: number) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const addImageSlot = () => {
    setImages([...images, Date.now()]);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Product</h1>
        <p className="text-sm text-gray-700">Complete all steps to list your product</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-2 border-gray-400 p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center gap-2 ${
                  currentStep === step.id ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${
                    currentStep === step.id
                      ? 'bg-gray-700 border-gray-800 text-white'
                      : step.completed
                      ? 'bg-gray-200 border-gray-400 text-gray-900'
                      : 'bg-white border-gray-400 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>
                <span className="text-xs font-bold text-gray-900 hidden md:block">{step.name}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border-2 border-gray-400 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Wireless Bluetooth Headphones"
                className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Product Description *
              </label>
              <textarea
                rows={6}
                placeholder="Describe your product in detail..."
                className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Category *
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600">
                  <option value="">Select category</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home & Living</option>
                  <option>Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Sub-Category *
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600">
                  <option value="">Select sub-category</option>
                  <option>Audio</option>
                  <option>Computers</option>
                  <option>Mobile Accessories</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Brand
              </label>
              <input
                type="text"
                placeholder="e.g., Samsung, Nike, etc."
                className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Step 2: Pricing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  MRP (Maximum Retail Price) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Selling Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-2 border-gray-400 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900">Discount</span>
                <span className="text-2xl font-bold text-gray-900">0%</span>
              </div>
              <p className="text-xs text-gray-600">
                Calculated based on MRP and Selling Price
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Tax Rate *
              </label>
              <select className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600">
                <option value="">Select tax rate</option>
                <option>0% - No Tax</option>
                <option>5% - Reduced Rate</option>
                <option>12% - Standard Rate</option>
                <option>18% - Standard Rate</option>
                <option>28% - Luxury Items</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Variants */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Variants</h2>
                <p className="text-sm text-gray-600">Add color, size, or other variations</p>
              </div>
              <button
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, idx) => (
                <div key={variant.id} className="p-4 border-2 border-gray-400 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900">Variant {idx + 1}</span>
                    {variants.length > 1 && (
                      <button
                        onClick={() => removeVariant(variant.id)}
                        className="p-2 border-2 border-gray-400 bg-white hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 text-gray-700" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Color</label>
                      <input
                        type="text"
                        placeholder="e.g., Black"
                        className="w-full px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Size</label>
                      <input
                        type="text"
                        placeholder="e.g., M"
                        className="w-full px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Stock</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">SKU</label>
                      <input
                        type="text"
                        placeholder="e.g., WH-001"
                        className="w-full px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Images */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Images</h2>
                <p className="text-sm text-gray-600">Upload up to 5 images (first will be primary)</p>
              </div>
              {images.length < 5 && (
                <button
                  onClick={addImageSlot}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Image</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Primary Image Slot */}
              <div className="col-span-2 md:col-span-1 md:row-span-2">
                <div className="aspect-square border-2 border-gray-400 bg-gray-100 flex flex-col items-center justify-center p-4 hover:bg-gray-200 cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-600 mb-2" />
                  <span className="text-sm font-bold text-gray-900 text-center">
                    Primary Image
                  </span>
                  <span className="text-xs text-gray-600 text-center mt-1">
                    Click to upload
                  </span>
                </div>
              </div>

              {/* Additional Image Slots */}
              {images.map((img, idx) => (
                <div key={img} className="relative">
                  <div className="aspect-square border-2 border-gray-400 bg-gray-100 flex flex-col items-center justify-center p-4 hover:bg-gray-200 cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="text-xs text-gray-600 text-center">
                      Image {idx + 2}
                    </span>
                  </div>
                  <button className="absolute top-2 right-2 p-1 bg-white border-2 border-gray-400 hover:bg-gray-100">
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-2 border-gray-400 bg-gray-50">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Image Guidelines:</span>
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                <li>• Minimum resolution: 800x800 pixels</li>
                <li>• Maximum file size: 5 MB per image</li>
                <li>• Supported formats: JPG, PNG</li>
                <li>• White background recommended</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 5: Shipping */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Details</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Length (cm) *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Width (cm) *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Shipping Charge *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5 border-2 border-gray-400" />
                <span className="text-sm font-bold text-gray-900">Free shipping</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Processing Time
              </label>
              <select className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600">
                <option>1-2 business days</option>
                <option>2-3 business days</option>
                <option>3-5 business days</option>
                <option>5-7 business days</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 6: Preview */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview & Submit</h2>

            <div className="p-6 border-2 border-gray-400 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-4">Product Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="w-40 font-bold text-gray-700">Product Name:</span>
                  <span className="text-gray-900">Wireless Bluetooth Headphones</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold text-gray-700">Category:</span>
                  <span className="text-gray-900">Electronics &gt; Audio</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold text-gray-700">Price:</span>
                  <span className="text-gray-900">$299.99 (50% off from $599.99)</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold text-gray-700">Variants:</span>
                  <span className="text-gray-900">1 variant(s)</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold text-gray-700">Images:</span>
                  <span className="text-gray-900">1 image(s) uploaded</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-bold text-gray-700">Shipping:</span>
                  <span className="text-gray-900">$5.00 (1-2 business days)</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-2 border-gray-400 bg-gray-50">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Note:</span> Your product will be sent for admin approval 
                before it goes live. You'll be notified once it's approved.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t-2 border-gray-300">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold"
              >
                Previous
              </button>
            )}
            <button className="px-6 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
              Save as Draft
            </button>
          </div>
          <div className="flex gap-3">
            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                <Save className="w-4 h-4" />
                <span>Submit for Approval</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}