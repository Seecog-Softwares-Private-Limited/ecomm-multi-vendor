"use client";

import { Link } from "../../components/Link";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import * as React from "react";

export type KYCApprovalPageProps = {
  sellerId?: string;
};

export function KYCApprovalPage({ sellerId = "" }: KYCApprovalPageProps) {
  const [showRejectModal, setShowRejectModal] = React.useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Back Button */}
      <Link href={`/admin/sellers/${sellerId}`} className="inline-flex items-center gap-2 text-sm text-gray-900 hover:underline mb-6 font-bold">
        <ArrowLeft className="w-4 h-4" />
        Back to Seller Details
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-sm text-gray-700 mt-1">Review and approve seller KYC documents</p>
        </div>
        <span className="inline-flex px-4 py-2 text-sm font-bold border-2 border-gray-400 bg-gray-200">
          Pending Review
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side - Seller Details */}
        <div className="space-y-6">
          {/* Seller Info */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-700">Business Name</label>
                <p className="mt-1 text-gray-900">Tech Store</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Owner Name</label>
                <p className="mt-1 text-gray-900">John Smith</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">john@techstore.com</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">+1 234 567 8901</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Business Address</label>
                <p className="mt-1 text-gray-900">123 Business Street, Suite 100, New York, NY 10001</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button className="w-full py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center justify-center gap-2 font-bold">
                <CheckCircle className="w-5 h-5" />
                Approve KYC
              </button>
              <button 
                onClick={() => setShowRejectModal(true)}
                className="w-full py-3 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-2 font-bold"
              >
                <XCircle className="w-5 h-5" />
                Reject KYC
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Documents */}
        <div className="space-y-6">
          {/* PAN Card */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">PAN Card</h3>
                <p className="text-sm text-gray-700">ABCDE1234F</p>
              </div>
            </div>
            <div className="aspect-video bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-bold">DOCUMENT PREVIEW</p>
                <p className="text-xs text-gray-600 mt-1">PAN Card</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
              View Full Document
            </button>
          </div>

          {/* GST Certificate */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">GST Certificate</h3>
                <p className="text-sm text-gray-700">22ABCDE1234F1Z5</p>
              </div>
            </div>
            <div className="aspect-video bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-bold">DOCUMENT PREVIEW</p>
                <p className="text-xs text-gray-600 mt-1">GST Certificate</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
              View Full Document
            </button>
          </div>

          {/* Address Proof */}
          <div className="bg-white border-2 border-gray-400 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Address Proof</h3>
                <p className="text-sm text-gray-700">Utility Bill</p>
              </div>
            </div>
            <div className="aspect-video bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-bold">DOCUMENT PREVIEW</p>
                <p className="text-xs text-gray-600 mt-1">Address Proof</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
              View Full Document
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-gray-400 max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject KYC</h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Rejection Reason
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
