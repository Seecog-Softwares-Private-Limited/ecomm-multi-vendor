import { AdminLoginPage } from "./admin/AdminLoginPage";
import { AdminDashboard } from "./admin/AdminDashboard";
import { SellerManagement } from "./admin/SellerManagement";
import { SellerDetailPage } from "./admin/SellerDetailPage";
import { KYCApprovalPage } from "./admin/KYCApprovalPage";
import { CategoriesManagement } from "./admin/CategoriesManagement";
import { ProductModeration } from "./admin/ProductModeration";
import { OrdersManagement } from "./admin/OrdersManagement";
import { OrderDetailPage } from "./admin/OrderDetailPage";
import { ReturnsManagement } from "./admin/ReturnsManagement";
import { SettlementDashboard } from "./admin/SettlementDashboard";
import { SalesAnalytics } from "./admin/SalesAnalytics";
import { NotificationsManagement } from "./admin/NotificationsManagement";
import { AdminProfileSettings } from "./admin/AdminProfileSettings";
import { HomePage } from "./HomePage";
import { HomePageEnhanced } from "./HomePageEnhanced";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { OTPVerificationPage } from "./OTPVerificationPage";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { ResetPasswordPage } from "./ResetPasswordPage";
import { CategoryListingPage } from "./CategoryListingPage";
import { SubCategoryListingPage } from "./SubCategoryListingPage";
import { SearchResultsPage } from "./SearchResultsPage";
import { ProductDetailPage } from "./ProductDetailPage";
import { ProductDetailPageEnhanced } from "./ProductDetailPageEnhanced";
import { ShoppingCartPage } from "./ShoppingCartPage";
import { CheckoutPage } from "./CheckoutPage";
import { AddNewAddressPage } from "./AddNewAddressPage";
import { OrderConfirmationPage } from "./OrderConfirmationPage";
// Seller Panel Pages
import { SellerLoginPage } from "./seller/SellerLoginPage";
import { SellerDashboard } from "./seller/SellerDashboard";
import { ProductUploadPage } from "./seller/ProductUploadPage";
import { InventoryManagementPage } from "./seller/InventoryManagementPage";
import { SellerOrderManagementPage } from "./seller/SellerOrderManagementPage";
import { SellerReportsPage } from "./seller/SellerReportsPage";
import { SellerSettingsPage } from "./seller/SellerSettingsPage";
import { Printer } from "lucide-react";

const PageSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="page-break mb-16">
    <div className="bg-gray-800 text-white p-4 mb-4 print:border-4 print:border-black">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    <div className="border-4 border-gray-400">
      {children}
    </div>
  </div>
);

export function PDFExportPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button - Hidden in print */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold shadow-lg"
        >
          <Printer className="w-5 h-5" />
          Print to PDF
        </button>
        <p className="text-xs text-gray-600 mt-2 text-right">Use Ctrl+P or Cmd+P</p>
      </div>

      {/* Cover Page */}
      <div className="page-break flex flex-col items-center justify-center min-h-screen text-center p-8">
        <div className="w-32 h-32 bg-gray-700 border-4 border-gray-800 flex items-center justify-center mb-8">
          <span className="text-white text-4xl font-bold">MH</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">MarketHub</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Multi-Vendor E-Commerce Marketplace</h2>
        <p className="text-xl text-gray-600 mb-8">Complete Production-Grade Wireframe Documentation</p>
        <div className="border-t-4 border-gray-400 w-64 my-8"></div>
        <p className="text-lg text-gray-700 font-bold">35 Pages</p>
        <p className="text-sm text-gray-600 mt-2">Customer Portal + Seller Panel + Admin Dashboard</p>
        <div className="mt-8 p-4 border-2 border-gray-400 bg-gray-50">
          <p className="text-xs text-gray-700 mb-1"><strong>Enhanced Homepage</strong> - Smart search, flash sales, recommendations</p>
          <p className="text-xs text-gray-700 mb-1"><strong>Enhanced Product Detail</strong> - Advanced reviews, Q&A, seller info</p>
          <p className="text-xs text-gray-700"><strong>Complete Seller Panel</strong> - Dashboard, inventory, orders, analytics</p>
        </div>
        <p className="text-sm text-gray-600 mt-8">Generated: February 20, 2026</p>
        <p className="text-xs text-gray-500 mt-2">Version 2.0 - Production-Grade Marketplace</p>
      </div>

      {/* Table of Contents */}
      <div className="page-break p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-4 border-gray-400 pb-4">Table of Contents</h2>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Customer E-Commerce Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 bg-gray-200 p-3 border-2 border-gray-400">Customer E-Commerce (16 Pages)</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>1. Homepage (Wireframe)</span>
                <span className="text-gray-600">Page 3</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>2. Homepage (Enhanced) ⭐</span>
                <span className="text-gray-600">Page 4</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>3. Login Page</span>
                <span className="text-gray-600">Page 5</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>4. Register Page</span>
                <span className="text-gray-600">Page 6</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>5. OTP Verification</span>
                <span className="text-gray-600">Page 7</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>6. Forgot Password</span>
                <span className="text-gray-600">Page 8</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>7. Reset Password</span>
                <span className="text-gray-600">Page 9</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>8. Category Listing</span>
                <span className="text-gray-600">Page 10</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>9. Sub-Category Listing</span>
                <span className="text-gray-600">Page 11</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>10. Search Results</span>
                <span className="text-gray-600">Page 12</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>11. Product Detail (Wireframe)</span>
                <span className="text-gray-600">Page 13</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>12. Product Detail (Enhanced) ⭐</span>
                <span className="text-gray-600">Page 14</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>13. Shopping Cart</span>
                <span className="text-gray-600">Page 15</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>14. Checkout</span>
                <span className="text-gray-600">Page 16</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>15. Add New Address</span>
                <span className="text-gray-600">Page 17</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>16. Order Confirmation</span>
                <span className="text-gray-600">Page 18</span>
              </li>
            </ol>
          </div>

          {/* Admin Dashboard Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 bg-gray-200 p-3 border-2 border-gray-400">Admin Dashboard (14 Pages)</h3>
            <ol className="space-y-2 text-sm" start={17}>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>17. Admin Login</span>
                <span className="text-gray-600">Page 19</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>18. Dashboard Overview</span>
                <span className="text-gray-600">Page 20</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>19. Seller Management</span>
                <span className="text-gray-600">Page 21</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>20. Seller Detail Page</span>
                <span className="text-gray-600">Page 22</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>21. KYC Approval</span>
                <span className="text-gray-600">Page 23</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>22. Categories Management</span>
                <span className="text-gray-600">Page 24</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>23. Product Moderation</span>
                <span className="text-gray-600">Page 25</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>24. Orders Management</span>
                <span className="text-gray-600">Page 26</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>25. Order Detail Page</span>
                <span className="text-gray-600">Page 27</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>26. Returns & Refunds</span>
                <span className="text-gray-600">Page 28</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>27. Settlement Dashboard</span>
                <span className="text-gray-600">Page 29</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>28. Sales Analytics</span>
                <span className="text-gray-600">Page 30</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>29. Notifications</span>
                <span className="text-gray-600">Page 31</span>
              </li>
              <li className="flex justify-between border-b border-gray-300 pb-2">
                <span>30. Profile Settings</span>
                <span className="text-gray-600">Page 32</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Seller Panel Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 bg-gray-700 text-white p-3 border-2 border-gray-800">Seller Panel (7 Pages) ⭐ NEW</h3>
          <ol className="space-y-2 text-sm grid grid-cols-2 gap-x-8" start={31}>
            <li className="flex justify-between border-b border-gray-300 pb-2">
              <span>31. Seller Login</span>
              <span className="text-gray-600">Page 33</span>
            </li>
            <li className="flex justify-between border-b border-gray-300 pb-2">
              <span>32. Seller Dashboard</span>
              <span className="text-gray-600">Page 34</span>
            </li>
            <li className="flex justify-between border-b border-gray-300 pb-2">
              <span>33. Product Upload (6-Step Form)</span>
              <span className="text-gray-600">Page 35</span>
            </li>
            <li className="flex justify-between border-b border-gray-300 pb-2">
              <span>34. Inventory Management</span>
              <span className="text-gray-600">Page 36</span>
            </li>
            <li className="flex justify-between border-b border-gray-300 pb-2">
              <span>35. Order Management</span>
              <span className="text-gray-600">Page 37</span>
            </li>
            <li className="flex justify-between border-b border-gray-300 pb-2">
              <span>36. Reports & Analytics</span>
              <span className="text-gray-600">Page 38</span>
            </li>
            <li className="flex justify-between border-b border-gray-300 pb-2">
              <span>37. Account Settings</span>
              <span className="text-gray-600">Page 39</span>
            </li>
          </ol>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-400">
          <p className="text-xs text-gray-700 font-bold mb-2">LEGEND:</p>
          <p className="text-xs text-gray-700">⭐ = Enhanced/Production-Grade Features</p>
        </div>
      </div>

      {/* Section Divider - Customer */}
      <div className="page-break flex items-center justify-center min-h-screen bg-gray-800 text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">CUSTOMER E-COMMERCE</h2>
          <p className="text-xl">16 Pages</p>
          <p className="text-sm mt-4 max-w-xl">Complete customer-facing marketplace experience with enhanced<br/>smart search, flash sales, and advanced product detail pages</p>
        </div>
      </div>

      {/* Customer Pages */}
      <PageSection title="1. Homepage (Wireframe)">
        <HomePage categories={[]} products={[]} />
      </PageSection>

      <PageSection title="2. Homepage (Enhanced) ⭐ - Smart Search, Flash Sales, Recommendations">
        <HomePageEnhanced />
      </PageSection>

      <PageSection title="3. Login Page">
        <LoginPage />
      </PageSection>

      <PageSection title="4. Register Page">
        <RegisterPage />
      </PageSection>

      <PageSection title="5. OTP Verification">
        <OTPVerificationPage />
      </PageSection>

      <PageSection title="6. Forgot Password">
        <ForgotPasswordPage />
      </PageSection>

      <PageSection title="7. Reset Password">
        <ResetPasswordPage />
      </PageSection>

      <PageSection title="8. Category Listing">
        <CategoryListingPage categoryName="" categorySlug="" products={[]} />
      </PageSection>

      <PageSection title="9. Sub-Category Listing">
        <SubCategoryListingPage />
      </PageSection>

      <PageSection title="10. Search Results">
        <SearchResultsPage />
      </PageSection>

      <PageSection title="11. Product Detail (Wireframe)">
        <ProductDetailPage />
      </PageSection>

      <PageSection title="12. Product Detail (Enhanced) ⭐ - Reviews, Q&A, Seller Info, Delivery">
        <ProductDetailPageEnhanced />
      </PageSection>

      <PageSection title="13. Shopping Cart">
        <ShoppingCartPage />
      </PageSection>

      <PageSection title="14. Checkout">
        <CheckoutPage />
      </PageSection>

      <PageSection title="15. Add New Address">
        <AddNewAddressPage />
      </PageSection>

      <PageSection title="16. Order Confirmation">
        <OrderConfirmationPage />
      </PageSection>

      {/* Section Divider - Admin */}
      <div className="page-break flex items-center justify-center min-h-screen bg-gray-800 text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">ADMIN DASHBOARD</h2>
          <p className="text-xl">14 Pages</p>
          <p className="text-sm mt-4 max-w-xl">Complete administrative control panel for managing sellers,<br/>products, orders, and marketplace operations</p>
        </div>
      </div>

      {/* Admin Pages */}
      <PageSection title="17. Admin Login">
        <AdminLoginPage />
      </PageSection>

      <PageSection title="18. Dashboard Overview">
        <AdminDashboard />
      </PageSection>

      <PageSection title="19. Seller Management">
        <SellerManagement />
      </PageSection>

      <PageSection title="20. Seller Detail Page">
        <SellerDetailPage />
      </PageSection>

      <PageSection title="21. KYC Approval">
        <KYCApprovalPage />
      </PageSection>

      <PageSection title="22. Categories Management">
        <CategoriesManagement />
      </PageSection>

      <PageSection title="23. Product Moderation">
        <ProductModeration />
      </PageSection>

      <PageSection title="24. Orders Management">
        <OrdersManagement />
      </PageSection>

      <PageSection title="25. Order Detail Page">
        <OrderDetailPage />
      </PageSection>

      <PageSection title="26. Returns & Refunds">
        <ReturnsManagement />
      </PageSection>

      <PageSection title="27. Settlement Dashboard">
        <SettlementDashboard />
      </PageSection>

      <PageSection title="28. Sales Analytics">
        <SalesAnalytics />
      </PageSection>

      <PageSection title="29. Notifications Management">
        <NotificationsManagement />
      </PageSection>

      <PageSection title="30. Profile Settings">
        <AdminProfileSettings />
      </PageSection>

      {/* Section Divider - Seller Panel */}
      <div className="page-break flex items-center justify-center min-h-screen bg-gray-700 text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">SELLER PANEL ⭐</h2>
          <p className="text-xl">7 Pages</p>
          <p className="text-sm mt-4 max-w-xl">Complete seller dashboard with analytics, product management,<br/>inventory control, order processing, and reporting capabilities</p>
        </div>
      </div>

      {/* Seller Panel Pages */}
      <PageSection title="31. Seller Login">
        <SellerLoginPage />
      </PageSection>

      <PageSection title="32. Seller Dashboard - Analytics & Quick Actions">
        <SellerDashboard />
      </PageSection>

      <PageSection title="33. Product Upload - 6-Step Multi-Step Form">
        <ProductUploadPage />
      </PageSection>

      <PageSection title="34. Inventory Management - Stock Control & Bulk Updates">
        <InventoryManagementPage />
      </PageSection>

      <PageSection title="35. Order Management - Track, Update & Process Orders">
        <SellerOrderManagementPage />
      </PageSection>

      <PageSection title="36. Reports & Analytics - Performance Metrics">
        <SellerReportsPage />
      </PageSection>

      <PageSection title="37. Account Settings - Profile & Business Info">
        <SellerSettingsPage />
      </PageSection>

      {/* End Page */}
      <div className="page-break flex flex-col items-center justify-center min-h-screen text-center p-8 bg-gray-100">
        <div className="w-24 h-24 bg-gray-700 border-4 border-gray-800 flex items-center justify-center mb-6">
          <span className="text-white text-2xl font-bold">MH</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">End of Documentation</h2>
        <p className="text-lg text-gray-700">MarketHub Multi-Vendor E-Commerce Marketplace</p>
        <p className="text-sm text-gray-600 mt-4 font-bold">37 Complete Production-Grade Pages</p>
        <div className="mt-6 p-4 border-2 border-gray-400 bg-white max-w-md">
          <p className="text-xs text-gray-700 mb-2"><strong>Implementation Status: 70% Complete</strong></p>
          <div className="space-y-1 text-left">
            <p className="text-xs text-gray-700">✅ Customer Portal - 16 pages (Enhanced Homepage & Product Detail)</p>
            <p className="text-xs text-gray-700">✅ Seller Panel - 7 pages (Complete with analytics & inventory)</p>
            <p className="text-xs text-gray-700">✅ Admin Dashboard - 14 pages (Full management capabilities)</p>
          </div>
        </div>
        <div className="border-t-4 border-gray-400 w-48 my-8"></div>
        <p className="text-sm text-gray-600">© 2026 MarketHub. All rights reserved.</p>
        <p className="text-xs text-gray-500 mt-2">Version 2.0 - Production-Grade Marketplace</p>
      </div>
    </div>
  );
}
