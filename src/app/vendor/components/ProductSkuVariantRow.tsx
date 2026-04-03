"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button, Input, FileUpload } from "./UIComponents";
import { vendorService } from "@/services/vendor.service";
import type { SkuVariantGroupFormRow } from "@/lib/product-sku-variant";
import { MAX_VARIANT_IMAGES } from "@/lib/product-sku-variant";

export type { SkuVariantGroupFormRow } from "@/lib/product-sku-variant";

export type ProductSkuVariantRowProps = {
  value: SkuVariantGroupFormRow;
  index: number;
  onChange: (next: SkuVariantGroupFormRow) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export function ProductSkuVariantRow({
  value,
  index,
  onChange,
  onRemove,
  canRemove,
}: ProductSkuVariantRowProps) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const updateSizeLine = (
    lineIndex: number,
    patch: Partial<SkuVariantGroupFormRow["sizes"][number]>
  ) => {
    const sizes = value.sizes.map((row, i) => (i === lineIndex ? { ...row, ...patch } : row));
    onChange({ ...value, sizes });
  };

  const addSizeLine = () => {
    onChange({
      ...value,
      sizes: [...value.sizes, { size: "", price: "", stock: "", sku: "" }],
    });
  };

  const removeSizeLine = (lineIndex: number) => {
    if (value.sizes.length <= 1) return;
    onChange({
      ...value,
      sizes: value.sizes.filter((_, i) => i !== lineIndex),
    });
  };

  const handleImageFile = async (file: File | null) => {
    setUploadError(null);
    if (!file) return;
    if (value.images.length >= MAX_VARIANT_IMAGES) {
      setUploadError(`At most ${MAX_VARIANT_IMAGES} images per variant.`);
      return;
    }
    setUploading(true);
    try {
      const { url } = await vendorService.uploadImage(file);
      onChange({ ...value, images: [...value.images, url] });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImageAt = (imgIndex: number) => {
    setUploadError(null);
    onChange({ ...value, images: value.images.filter((_, i) => i !== imgIndex) });
  };

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-4 relative">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#475569]">Variant {index + 1}</span>
        {canRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-[#DC2626]">
            <X className="w-4 h-4" />
            Remove
          </Button>
        ) : null}
      </div>

      <div className="max-w-md">
        <Input
          label="Color / style"
          type="text"
          placeholder="e.g. Tempest Gray (optional if you only use sizes)"
          value={value.color}
          onChange={(e) => onChange({ ...value, color: e.target.value })}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#1E293B] mb-2">Variant images (optional)</p>
        <p className="text-xs text-[#64748B] mb-3">
          Up to {MAX_VARIANT_IMAGES} images — shared across all sizes in this variant. Shown first on the product
          page when this option is selected.
        </p>
        {value.images.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {value.images.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group rounded-lg border border-[#E2E8F0] overflow-hidden w-20 h-20 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImageAt(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {value.images.length < MAX_VARIANT_IMAGES ? (
          <FileUpload
            label={value.images.length ? "Add another image" : "Upload images"}
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageFile}
            disabled={uploading}
            uploading={uploading}
            uploadedUrl={null}
            helperText="JPEG, PNG, WebP or GIF — same limits as product images."
            error={uploadError ?? undefined}
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#1E293B]">Sizes &amp; inventory</p>
          <Button type="button" variant="secondary" size="sm" onClick={addSizeLine}>
            <Plus className="w-4 h-4" />
            Add size
          </Button>
        </div>
        <p className="text-xs text-[#64748B]">
          Add one row per sellable size. Each row has its own price, stock, and optional SKU.
        </p>
        <div className="space-y-3">
          {value.sizes.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className="rounded-lg border border-[#E2E8F0] bg-white p-3 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Size {lineIndex + 1}
                </span>
                {value.sizes.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeSizeLine(lineIndex)}
                    className="text-xs font-medium text-[#DC2626] hover:text-[#B91C1C] underline-offset-2 hover:underline"
                  >
                    Remove size
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Size"
                  type="text"
                  placeholder="e.g. S, M, 256GB"
                  value={line.size}
                  onChange={(e) => updateSizeLine(lineIndex, { size: e.target.value })}
                />
                <Input
                  label="Variant SKU (optional)"
                  type="text"
                  placeholder="SKU for this size"
                  value={line.sku}
                  onChange={(e) => updateSizeLine(lineIndex, { sku: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Selling price (₹)"
                  type="number"
                  placeholder="0"
                  value={line.price}
                  onChange={(e) => updateSizeLine(lineIndex, { price: e.target.value })}
                />
                <Input
                  label="Stock"
                  type="number"
                  placeholder="0"
                  value={line.stock}
                  onChange={(e) => updateSizeLine(lineIndex, { stock: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
