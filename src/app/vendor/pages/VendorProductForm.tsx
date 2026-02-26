"use client";

import { Save, Send, ArrowLeft, X, Plus } from "lucide-react";
import { Button, Input, Textarea, Select, FileUpload, Card, Alert } from "../components/UIComponents";
import { vendorService } from "@/services/vendor.service";
import * as React from "react";

export type VendorProductFormProps = {
  productId?: string;
  onBack?: () => void;
  onSave?: (isDraft: boolean) => void;
};

export function VendorProductForm({ productId = "", onBack, onSave }: VendorProductFormProps) {
  const isEdit = !!productId;

  const [loadingProduct, setLoadingProduct] = React.useState(isEdit);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!productId) {
      setLoadingProduct(false);
      return;
    }
    let cancelled = false;
    setLoadError(null);
    setLoadingProduct(true);
    vendorService
      .getProduct(productId)
      .then((product) => {
        if (cancelled) return;
        setFormData({
          name: product.name,
          category: product.categorySlug,
          subCategory: product.subCategorySlug,
          description: product.description ?? "",
          sku: product.sku,
          mrp: String(product.mrp),
          sellingPrice: String(product.sellingPrice),
          gst: product.gstPercent != null ? String(product.gstPercent) : "18",
          stock: String(product.stock),
          returnPolicy: product.returnPolicy,
          status: product.status === "DRAFT" ? "draft" : "pending",
          images: Array.isArray(product.imageUrls) ? product.imageUrls : [],
        });
        setSpecifications(
          product.specifications.length > 0
            ? product.specifications
            : [{ key: "", value: "" }]
        );
        setVariations(
          product.variations.map((v) => ({
            name: v.name,
            values: Array.isArray(v.values) ? v.values.join(", ") : "",
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load product");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const [formData, setFormData] = React.useState({
    name: "",
    category: "",
    subCategory: "",
    description: "",
    sku: "",
    mrp: "",
    sellingPrice: "",
    gst: "18",
    stock: "",
    returnPolicy: "7days",
    status: "draft",
    images: [] as string[],
  });

  const [specifications, setSpecifications] = React.useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  const [variations, setVariations] = React.useState<{ name: string; values: string }[]>([]);

  const categories = [
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
    { value: "home", label: "Home & Kitchen" },
    { value: "books", label: "Books" },
  ];

  const subCategories: Record<string, { value: string; label: string }[]> = {
    electronics: [
      { value: "mobiles", label: "Mobile Phones" },
      { value: "laptops", label: "Laptops" },
      { value: "accessories", label: "Accessories" },
    ],
    fashion: [
      { value: "mens", label: "Men's Clothing" },
      { value: "womens", label: "Women's Clothing" },
      { value: "kids", label: "Kids Wear" },
    ],
    home: [
      { value: "kitchen", label: "Kitchen" },
      { value: "furniture", label: "Furniture" },
      { value: "decor", label: "Home Decor" },
    ],
    books: [
      { value: "fiction", label: "Fiction" },
      { value: "nonfiction", label: "Non-Fiction" },
      { value: "education", label: "Educational" },
    ],
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleSubmit = async (isDraft: boolean) => {
    if (!formData.name.trim() || !formData.category || !formData.subCategory || !formData.sku.trim()) {
      setSubmitError("Please fill in required fields: Name, Category, Sub Category, SKU.");
      return;
    }
    const mrp = Number(formData.mrp);
    const sellingPrice = Number(formData.sellingPrice);
    const stock = Number(formData.stock);
    if (isNaN(mrp) || mrp < 0 || isNaN(sellingPrice) || sellingPrice < 0 || isNaN(stock) || stock < 0) {
      setSubmitError("Please enter valid numbers for MRP, Selling Price, and Stock.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      categorySlug: formData.category,
      subCategorySlug: formData.subCategory,
      sku: formData.sku.trim(),
      mrp,
      sellingPrice,
      gstPercent: formData.gst ? Number(formData.gst) : undefined,
      stock,
      returnPolicy: formData.returnPolicy as "7days" | "10days" | "15days" | "no-return",
      status: (isDraft ? "DRAFT" : "PENDING_APPROVAL") as "DRAFT" | "PENDING_APPROVAL",
      imageUrls: formData.images.length > 0 ? formData.images : undefined,
      specifications:
        specifications.some((s) => s.key.trim() || s.value.trim())
          ? specifications
              .filter((s) => s.key.trim() || s.value.trim())
              .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
          : undefined,
      variations:
        variations.some((v) => v.name.trim())
          ? variations
              .filter((v) => v.name.trim())
              .map((v) => ({
                name: v.name.trim(),
                values:
                  typeof v.values === "string"
                    ? v.values.split(",").map((s) => s.trim()).filter(Boolean)
                    : [],
              }))
          : undefined,
    };
    try {
      if (isEdit) {
        await vendorService.updateProduct(productId, payload);
      } else {
        await vendorService.createProduct(payload);
      }
      onSave?.(isDraft);
      onBack?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file || (formData.images ?? []).length >= 5) return;
    setUploadError(null);
    setUploadingImage(true);
    try {
      const { url } = await vendorService.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images ?? []), url],
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onBack?.()}
          className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#64748B]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-[#64748B]">Fill in the details to list your product</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert
        type="info"
        message="Products must be approved by admin before they appear on the marketplace. Make sure all information is accurate."
      />

      {loadError && (
        <Alert
          type="error"
          message={loadError}
        />
      )}

      {submitError && (
        <Alert
          type="error"
          message={submitError}
        />
      )}

      {loadingProduct ? (
        <div className="py-12 text-center text-[#64748B]">Loading product…</div>
      ) : (
        <>
      {/* Basic Information */}
      <Card title="Basic Information">
        <div className="space-y-6">
          <Input
            label="Product Name"
            placeholder="e.g., Wireless Bluetooth Headphones"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            helperText="Clear, descriptive product name"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: "" })}
              options={[{ value: "", label: "Select Category" }, ...categories]}
              required
            />
            <Select
              label="Sub Category"
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              options={[
                { value: "", label: "Select Sub Category" },
                ...(formData.category ? subCategories[formData.category] || [] : []),
              ]}
              disabled={!formData.category}
              required
            />
          </div>

          <Textarea
            label="Product Description"
            placeholder="Describe your product in detail..."
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            helperText="Include key features, benefits, and specifications"
            required
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            placeholder="e.g., WBH-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            helperText="Unique identifier for your product"
            required
          />
        </div>
      </Card>

      {/* Product Specifications */}
      <Card
        title="Product Specifications"
        actions={
          <Button variant="ghost" size="sm" onClick={addSpecification}>
            <Plus className="w-4 h-4" />
            Add Field
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[#64748B]">Add technical specifications based on your sub-category</p>
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Specification name (e.g., Battery Life)"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, "key", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Value (e.g., 20 hours)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, "value", e.target.value)}
                />
              </div>
              {specifications.length > 1 && (
                <button
                  onClick={() => removeSpecification(index)}
                  className="p-3 text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Pricing & Inventory */}
      <Card title="Pricing & Inventory">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="MRP (Maximum Retail Price)"
              type="number"
              placeholder="0"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
              helperText="Original price"
              required
            />
            <Input
              label="Selling Price"
              type="number"
              placeholder="0"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              helperText="Customer pays this"
              required
            />
            <Select
              label="GST %"
              value={formData.gst}
              onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
              options={[
                { value: "0", label: "0%" },
                { value: "5", label: "5%" },
                { value: "12", label: "12%" },
                { value: "18", label: "18%" },
                { value: "28", label: "28%" },
              ]}
              required
            />
          </div>

          <Input
            label="Stock Quantity"
            type="number"
            placeholder="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            helperText="Available units"
            required
          />

          <Select
            label="Return Policy"
            value={formData.returnPolicy}
            onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
            options={[
              { value: "no-return", label: "No Returns" },
              { value: "7days", label: "7 Days Return" },
              { value: "10days", label: "10 Days Return" },
              { value: "15days", label: "15 Days Return" },
            ]}
          />
        </div>
      </Card>

      {/* Product Images */}
      <Card title="Product Images">
        <div className="space-y-4">
          <Alert
            type="info"
            message="Upload high-quality images. Minimum 500x500px square format. Maximum 5 images. Supported: JPEG, PNG, WebP, GIF (max 5MB each)."
          />
          {uploadError && (
            <Alert type="error" message={uploadError} />
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(formData.images ?? []).map((image, index) => (
              <div key={image || index} className="relative group">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-xl border-2 border-[#E2E8F0]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (placeholder) placeholder.style.display = "block";
                  }}
                />
                <div
                  className="w-full h-32 rounded-xl border-2 border-[#E2E8F0] bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-sm"
                  style={{ display: "none" }}
                  aria-hidden
                >
                  Image unavailable
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Upload New */}
            {(formData.images ?? []).length < 5 && (
              <FileUpload
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                helperText={
                  uploadingImage
                    ? "Uploading…"
                    : `${(formData.images ?? []).length}/5 uploaded`
                }
              />
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-[#E2E8F0]">
        <Button variant="ghost" onClick={() => onBack?.()} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => handleSubmit(true)} disabled={submitting}>
          <Save className="w-5 h-5" />
          {submitting ? "Saving…" : "Save as Draft"}
        </Button>
        <Button variant="primary" onClick={() => handleSubmit(false)} disabled={submitting}>
          <Send className="w-5 h-5" />
          {submitting ? "Submitting…" : "Submit for Approval"}
        </Button>
      </div>
        </>
      )}
    </div>
  );
}
