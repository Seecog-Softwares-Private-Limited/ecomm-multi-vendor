import Link from "next/link";
import { BookOpen, ArrowLeft, CircleCheck } from "lucide-react";

const points = [
  "Keep product titles clear, searchable, and category-accurate.",
  "Upload real product images with good lighting and no watermark overlays.",
  "Mention MRP, selling price, tax, and stock accurately at all times.",
  "Pack orders safely and dispatch within your committed handling time.",
  "Respond quickly to customer questions and support tickets.",
  "Avoid prohibited or restricted listings to prevent account actions.",
];

export default function VendorGuidelinesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/vendor/support"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Support
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Guidelines</h1>
            <p className="text-sm text-slate-600">Baseline rules for compliant and high-quality selling.</p>
          </div>
        </div>

        <div className="space-y-3">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-sm text-slate-700">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
