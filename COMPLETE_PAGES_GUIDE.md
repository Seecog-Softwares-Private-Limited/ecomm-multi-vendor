# 📄 Complete Pages Guide - MarketHub E-Commerce Marketplace

## Overview

This document provides a comprehensive reference for all **37 pages** built in the MarketHub multi-vendor e-commerce marketplace application.

**Generated**: February 20, 2026  
**Version**: 2.0.0  
**Completion**: 70% (7 of 10 modules)

---

## 📊 Quick Statistics

| Metric | Count |
|--------|-------|
| **Total Pages** | 37 |
| **Customer Pages** | 16 (14 basic + 2 enhanced) |
| **Admin Pages** | 14 |
| **Seller Pages** | 7 |
| **Total Routes** | 38 |
| **Layouts** | 3 (Root, Admin, Seller) |
| **Completion** | 70% |

---

## 🗂️ Complete Pages List

### SECTION 1: CUSTOMER E-COMMERCE PORTAL (16 Pages)

#### 1.1 Homepage - Wireframe Version
- **File**: `/src/app/pages/HomePage.tsx`
- **Route**: `/home-wireframe`
- **Purpose**: Original low-fidelity homepage wireframe
- **Features**:
  - Basic header with logo and navigation
  - Simple search bar
  - Category grid
  - Featured products section
  - Footer with links
  - Grayscale wireframe design

#### 1.2 Homepage - Enhanced Version ⭐
- **File**: `/src/app/pages/HomePageEnhanced.tsx`
- **Route**: `/` (default homepage)
- **Purpose**: Production-grade homepage with advanced features
- **Features**:
  - **Smart Search**:
    - Autocomplete dropdown
    - Trending searches display
    - Recent searches (logged-in users)
    - Product thumbnail suggestions
    - Category suggestions
    - Keyboard navigation
  - **Flash Sales Section**:
    - Countdown timer (HH:MM:SS)
    - Limited stock indicators
    - Discount badges
    - "Selling Fast" ribbons
  - **Personalized Recommendations**:
    - Product grid
    - Wishlist toggle
    - Rating + review count
  - **Delivery Pincode Checker**:
    - Input validation
    - Delivery estimate results
    - COD availability indicator
    - Error states
  - **Trust Badges**: Secure Payment, Fast Delivery, Easy Returns, Quality Verified
  - Mobile-responsive (2-col mobile, 4-col desktop)

#### 1.3 Login Page
- **File**: `/src/app/pages/LoginPage.tsx`
- **Route**: `/login`
- **Purpose**: Customer authentication
- **Features**:
  - Email/password form
  - "Remember me" checkbox
  - "Forgot password?" link
  - "Sign up" link
  - Form validation
  - Error states
  - Social login placeholders

#### 1.4 Register Page
- **File**: `/src/app/pages/RegisterPage.tsx`
- **Route**: `/register`
- **Purpose**: New customer registration
- **Features**:
  - Full name, email, password, confirm password
  - Terms & conditions checkbox
  - Form validation
  - "Already have account?" link
  - Password strength indicator
  - Error states

#### 1.5 OTP Verification Page
- **File**: `/src/app/pages/OTPVerificationPage.tsx`
- **Route**: `/otp-verification`
- **Purpose**: Verify email/phone with OTP
- **Features**:
  - 6-digit OTP input boxes
  - Auto-focus next input
  - Resend OTP button
  - Timer countdown (30 seconds)
  - Verify button
  - Success/error states

#### 1.6 Forgot Password Page
- **File**: `/src/app/pages/ForgotPasswordPage.tsx`
- **Route**: `/forgot-password`
- **Purpose**: Initiate password reset
- **Features**:
  - Email input field
  - Send reset link button
  - Back to login link
  - Email validation
  - Success confirmation message
  - Error states

#### 1.7 Reset Password Page
- **File**: `/src/app/pages/ResetPasswordPage.tsx`
- **Route**: `/reset-password`
- **Purpose**: Set new password after reset
- **Features**:
  - New password input
  - Confirm password input
  - Password strength indicator
  - Submit button
  - Success redirect to login
  - Validation errors

#### 1.8 Category Listing Page
- **File**: `/src/app/pages/CategoryListingPage.tsx`
- **Route**: `/category/:categoryName`
- **Purpose**: Browse products by category
- **Features**:
  - Breadcrumb navigation
  - Filter sidebar (Price, Brand, Rating)
  - Sort dropdown (Price, Popularity, Rating)
  - Product grid (4 columns)
  - Product cards with image, name, price, rating
  - Pagination
  - Results count
  - Mobile-responsive

#### 1.9 Sub-Category Listing Page
- **File**: `/src/app/pages/SubCategoryListingPage.tsx`
- **Route**: `/category/:categoryName/:subCategoryName`
- **Purpose**: Browse products by sub-category
- **Features**:
  - All features from Category Listing
  - More specific breadcrumb
  - Sub-category specific filters
  - Refined product results

#### 1.10 Search Results Page
- **File**: `/src/app/pages/SearchResultsPage.tsx`
- **Route**: `/search?q=keyword`
- **Purpose**: Display search results
- **Features**:
  - Search query display
  - Results count ("Showing X results for 'keyword'")
  - Filter sidebar
  - Sort options
  - Product grid
  - "No results found" empty state
  - Search suggestions
  - Pagination

#### 1.11 Product Detail - Wireframe Version
- **File**: `/src/app/pages/ProductDetailPage.tsx`
- **Route**: `/product-wireframe/:productId`
- **Purpose**: Original product detail wireframe
- **Features**:
  - Basic image gallery (5 thumbnails)
  - Product name, price, description
  - Variant selector (Size, Color)
  - Quantity selector
  - Add to cart button
  - Product specifications
  - Reviews section (basic)
  - Related products

#### 1.12 Product Detail - Enhanced Version ⭐
- **File**: `/src/app/pages/ProductDetailPageEnhanced.tsx`
- **Route**: `/product/:productId` (default)
- **Purpose**: Production-grade product detail with all features
- **Features**:
  - **Image Gallery**: 5 thumbnails, zoom, lightbox
  - **Wishlist Toggle**: Heart icon (filled/unfilled)
  - **Share Modal**: Facebook, Twitter, WhatsApp, Copy Link
  - **Seller Information Card**:
    - Seller name & logo
    - Seller rating (4.7 stars)
    - Total sales (12,456 sold)
    - "View Store" button
    - "Contact Seller" button
    - Response time indicator
  - **Delivery & Returns**:
    - Pincode-based delivery estimate
    - Delivery timeline (2-3 business days)
    - Return window (7 days)
    - Replacement eligibility
    - Refund timeline (5-7 business days)
    - COD availability
  - **Stock Indicators**:
    - In Stock (green checkmark)
    - Low Stock ("Only X left" in red)
    - Out of Stock (gray)
  - **Variant Selection**: Color (Black, White, Blue)
  - **Quantity Selector**: Min/max validation (1-10)
  - **EMI Options**: "View plans" link
  - **Advanced Reviews Section**:
    - Overall rating (4.5/5)
    - Total review count (360)
    - Rating breakdown chart (5-star bars)
    - Filter by star rating (clickable)
    - Photo reviews with count
    - Verified purchase badge
    - Write review modal (star rating, text, photo upload)
    - Sort options (Most Helpful, Most Recent, Highest/Lowest)
    - Helpful vote count
    - "With Photos" filter
    - "Verified Purchase" filter
  - **Q&A Section**:
    - Question display
    - Seller-highlighted answers
    - "Ask Question" modal
    - Upvote/helpful counter
    - Timestamp display
  - **Product Specifications**: Table with 8+ specs
  - **Available Offers**: Bank offers, EMI, Cashback
  - **Key Features**: Bullet list
  - **Breadcrumb Navigation**
  - **Add to Cart Toast**: Success confirmation
  - **All Interaction States**: Hover, focus, loading, error

#### 1.13 Shopping Cart Page
- **File**: `/src/app/pages/ShoppingCartPage.tsx`
- **Route**: `/cart`
- **Purpose**: Review and manage cart items
- **Features**:
  - Cart items list (image, name, price, quantity)
  - Quantity update controls
  - Remove item button
  - "Save for later" option
  - Price breakdown (Subtotal, Shipping, Tax, Total)
  - "Continue Shopping" button
  - "Proceed to Checkout" button
  - Empty cart state
  - Cart count badge

#### 1.14 Checkout Page
- **File**: `/src/app/pages/CheckoutPage.tsx`
- **Route**: `/checkout`
- **Purpose**: Complete order purchase
- **Features**:
  - **Delivery Address Section**:
    - Saved addresses list
    - "Add new address" button
    - Address selection radio buttons
  - **Order Summary Section**:
    - Product list
    - Price breakdown
    - Subtotal, shipping, tax, total
  - **Payment Method Section**:
    - Credit/Debit Card
    - Net Banking
    - UPI
    - Cash on Delivery (COD)
    - Wallet options
  - **Place Order Button**
  - Progress steps (Cart → Address → Payment → Confirm)
  - Mobile-responsive

#### 1.15 Add New Address Page
- **File**: `/src/app/pages/AddNewAddressPage.tsx`
- **Route**: `/add-address`
- **Purpose**: Add delivery address
- **Features**:
  - Full Name input
  - Phone Number input (10 digits validation)
  - Pincode input (6 digits validation)
  - State dropdown
  - City input
  - House No / Building Name
  - Road / Area
  - Landmark (optional)
  - Address Type (Home / Office)
  - "Save address" button
  - Form validation
  - Error states

#### 1.16 Order Confirmation Page
- **File**: `/src/app/pages/OrderConfirmationPage.tsx`
- **Route**: `/order-confirmation`
- **Purpose**: Confirm successful order
- **Features**:
  - Success checkmark icon
  - "Order Placed Successfully!" message
  - Order ID display
  - Expected delivery date
  - Order details summary
  - Delivery address
  - Payment method
  - "Track Order" button
  - "Continue Shopping" button
  - Email/SMS confirmation notice

---

### SECTION 2: ADMIN DASHBOARD (14 Pages)

#### 2.1 Admin Login Page
- **File**: `/src/app/pages/admin/AdminLoginPage.tsx`
- **Route**: `/admin/login`
- **Purpose**: Admin authentication
- **Features**:
  - Admin-specific branding
  - Email/password form
  - "Remember me" checkbox
  - Forgot password link
  - Enhanced security notice
  - Form validation
  - Error states
  - Different styling from customer login

#### 2.2 Admin Dashboard Overview
- **File**: `/src/app/pages/admin/AdminDashboard.tsx`
- **Route**: `/admin`
- **Purpose**: Main admin control panel
- **Features**:
  - **Key Metrics Cards**:
    - Total Revenue (with trend)
    - Total Orders (with trend)
    - Active Sellers (with trend)
    - Pending KYC (with count)
  - **Revenue Chart**: Line chart (30 days)
  - **Recent Orders Table**: 10 latest orders
  - **Pending Actions Widget**:
    - Products awaiting approval
    - KYC pending
    - Returns to process
    - Disputes to resolve
  - **Top Sellers Widget**: 5 sellers with revenue
  - **Quick Action Buttons**
  - Responsive grid layout

#### 2.3 Seller Management Page
- **File**: `/src/app/pages/admin/SellerManagement.tsx`
- **Route**: `/admin/sellers`
- **Purpose**: Manage all sellers
- **Features**:
  - **Sellers Table**:
    - Seller name & logo
    - Email
    - Phone
    - Status (Active/Inactive/Pending)
    - KYC Status (Approved/Pending/Rejected)
    - Total Products
    - Total Revenue
    - Join Date
    - Actions (View, Edit, Suspend, Approve)
  - **Filters**: Status, KYC Status, Date Range
  - **Search**: By name, email, phone
  - **Bulk Actions**: Approve, Suspend, Export
  - **Pagination**
  - **"Add New Seller" button**
  - Responsive table

#### 2.4 Seller Detail Page
- **File**: `/src/app/pages/admin/SellerDetailPage.tsx`
- **Route**: `/admin/sellers/:sellerId`
- **Purpose**: View seller details
- **Features**:
  - **Business Information**:
    - Business name, type
    - GST, PAN
    - Registration date
    - Address
  - **Contact Information**:
    - Owner name
    - Email, phone
    - Website
  - **Performance Metrics**:
    - Total revenue
    - Total orders
    - Product count
    - Average rating
    - Customer complaints
  - **Products List**: Table of seller's products
  - **Orders List**: Recent orders
  - **Revenue Chart**: Monthly revenue
  - **Action Buttons**: Approve, Suspend, Send Message
  - **Activity Log**: Recent activities
  - Back button

#### 2.5 KYC Approval Page
- **File**: `/src/app/pages/admin/KYCApprovalPage.tsx`
- **Route**: `/admin/kyc/:sellerId`
- **Purpose**: Review and approve seller KYC
- **Features**:
  - **Seller Details**: Name, email, phone
  - **Document Upload Section**:
    - Business registration certificate (image preview)
    - GST certificate (image preview)
    - PAN card (image preview)
    - Bank account proof (image preview)
    - Address proof (image preview)
  - **Document Verification Checklist**:
    - GST number verified
    - PAN verified
    - Bank account verified
    - Address verified
    - Each with checkbox
  - **Verification Status**: Pending/In Review/Verified/Rejected
  - **Admin Notes**: Text area for remarks
  - **Action Buttons**:
    - Approve KYC
    - Reject KYC
    - Request More Info
  - **Rejection Reason Modal**
  - Back to seller management link

#### 2.6 Categories Management Page
- **File**: `/src/app/pages/admin/CategoriesManagement.tsx`
- **Route**: `/admin/categories`
- **Purpose**: Manage product categories
- **Features**:
  - **Categories Tree**:
    - Parent categories
    - Sub-categories (expandable)
    - Category count
  - **Categories Table**:
    - Category name
    - Parent category
    - Product count
    - Status (Active/Inactive)
    - Sort order
    - Actions (Edit, Delete, Add Subcategory)
  - **Add Category Modal**:
    - Category name
    - Parent category dropdown
    - Icon upload
    - Sort order
    - Status toggle
  - **Edit Category Modal**
  - **Delete Confirmation Modal**
  - Drag & drop reordering
  - Search categories
  - Bulk actions

#### 2.7 Product Moderation Page
- **File**: `/src/app/pages/admin/ProductModeration.tsx`
- **Route**: `/admin/products`
- **Purpose**: Approve/reject seller products
- **Features**:
  - **Products Table**:
    - Product image (thumbnail)
    - Product name
    - Seller name
    - Category
    - Price
    - Stock
    - Status (Pending/Approved/Rejected/Active/Inactive)
    - Submitted date
    - Actions (View, Approve, Reject, Edit)
  - **Filter Tabs**: All, Pending, Approved, Rejected, Active, Inactive
  - **Search**: By name, SKU, seller
  - **Bulk Actions**: Approve, Reject, Export
  - **Product Detail Modal**:
    - Full product info
    - Images gallery
    - Description
    - Specifications
    - Pricing
    - Stock
  - **Rejection Reason Modal**: Text area + reason dropdown
  - Pagination
  - Export to CSV

#### 2.8 Orders Management Page
- **File**: `/src/app/pages/admin/OrdersManagement.tsx`
- **Route**: `/admin/orders`
- **Purpose**: Monitor all marketplace orders
- **Features**:
  - **Orders Table**:
    - Order ID
    - Customer name
    - Seller name
    - Product(s)
    - Order date
    - Amount
    - Status (New, Processing, Shipped, Delivered, Cancelled, Returned)
    - Payment status (Paid/Pending/Failed/Refunded)
    - Actions (View Details, Update Status)
  - **Filter Tabs**: All, New, Processing, Shipped, Delivered, Cancelled, Returned
  - **Date Range Filter**
  - **Search**: By order ID, customer, seller
  - **Status Filter**: Dropdown
  - **Payment Status Filter**: Dropdown
  - **Bulk Actions**: Update status, Export
  - **Export to CSV**
  - Pagination
  - Order count badges on tabs

#### 2.9 Order Detail Page
- **File**: `/src/app/pages/admin/OrderDetailPage.tsx`
- **Route**: `/admin/orders/:orderId`
- **Purpose**: View complete order information
- **Features**:
  - **Order Summary**:
    - Order ID
    - Order date
    - Status with timeline
    - Payment status
    - Payment method
  - **Customer Information**:
    - Name
    - Email
    - Phone
    - Delivery address
  - **Seller Information**:
    - Seller name
    - Contact details
  - **Product Details**:
    - Product list
    - Image, name, variant
    - Quantity
    - Unit price
    - Subtotal
  - **Price Breakdown**:
    - Subtotal
    - Shipping charges
    - Tax
    - Discount
    - Total amount
  - **Tracking Information**:
    - Courier name
    - Tracking ID
    - Shipment status
    - Estimated delivery
  - **Order Timeline**: Visual timeline of status changes
  - **Action Buttons**: Update Status, Print Invoice, Refund, Cancel
  - **Activity Log**: All order activities with timestamps
  - Back to orders list

#### 2.10 Returns & Refunds Management
- **File**: `/src/app/pages/admin/ReturnsManagement.tsx`
- **Route**: `/admin/returns`
- **Purpose**: Process return requests
- **Features**:
  - **Returns Table**:
    - Return ID
    - Order ID
    - Customer name
    - Product details
    - Return reason
    - Return date
    - Return status (Requested, Approved, Rejected, Completed)
    - Refund status (Pending/Processed)
    - Amount
    - Actions (View, Approve, Reject, Process Refund)
  - **Filter Tabs**: All, Requested, Approved, Rejected, Completed
  - **Date Range Filter**
  - **Search**: By return ID, order ID, customer
  - **Return Detail Modal**:
    - Full return info
    - Uploaded images (customer photos)
    - Return reason details
    - Admin notes
  - **Approve/Reject Modal**: With reason text area
  - **Process Refund Modal**:
    - Refund method (Original payment/Store credit)
    - Refund amount
    - Processing fee deduction
    - Confirm button
  - **Bulk Actions**: Approve, Reject
  - Pagination
  - Export to CSV

#### 2.11 Settlement Dashboard
- **File**: `/src/app/pages/admin/SettlementDashboard.tsx`
- **Route**: `/admin/settlements`
- **Purpose**: Manage seller payouts
- **Features**:
  - **Pending Settlements Summary**:
    - Total pending amount
    - Number of sellers
    - Settlement period
  - **Settlement Table**:
    - Seller name
    - Settlement period (date range)
    - Total orders
    - Gross amount
    - Commission (platform fee)
    - Tax
    - Net payable
    - Status (Pending/Processing/Completed)
    - Payment date
    - Actions (View Details, Process Payment, Download Invoice)
  - **Filter Tabs**: Pending, Processing, Completed
  - **Date Range Filter**
  - **Search**: By seller name
  - **Settlement Detail Modal**:
    - Breakdown of all orders
    - Commission calculation
    - Tax calculation
    - Deductions (if any)
    - Net amount
  - **Process Payment Modal**:
    - Bank transfer details
    - UTR number input
    - Confirm button
  - **Bulk Process**: Select multiple settlements
  - Export to CSV/PDF
  - Settlement calendar view

#### 2.12 Sales Analytics Page
- **File**: `/src/app/pages/admin/SalesAnalytics.tsx`
- **Route**: `/admin/analytics`
- **Purpose**: View marketplace analytics
- **Features**:
  - **Date Range Selector**: Today, Yesterday, Last 7/30/90 days, Custom
  - **Key Metrics Cards**:
    - Total Revenue (with % change vs previous period)
    - Total Orders (with % change)
    - GMV - Gross Merchandise Value (with % change)
    - Average Order Value (with % change)
    - Conversion Rate (with % change)
    - Active Customers (with % change)
  - **Revenue Chart**: Line chart (daily/weekly/monthly view)
  - **Category Performance**:
    - Pie chart (revenue by category)
    - Table with category, revenue, orders, growth
  - **Top 10 Sellers**:
    - Table with seller name, revenue, orders, growth %
  - **Top 10 Products**:
    - Table with product, category, revenue, units sold
  - **Traffic Sources**: Pie chart (Direct, Search, Social, Referral)
  - **Conversion Funnel**: Visual funnel (Visit → Product View → Cart → Checkout → Purchase)
  - **Export Report Button**: PDF/CSV options
  - **Compare Periods**: Toggle to compare with previous period
  - Responsive charts

#### 2.13 Notifications Management
- **File**: `/src/app/pages/admin/NotificationsManagement.tsx`
- **Route**: `/admin/notifications`
- **Purpose**: Send notifications to users/sellers
- **Features**:
  - **Create Notification Section**:
    - Recipient type (All Users / All Sellers / Specific User / Specific Seller)
    - Notification type (Info / Warning / Promotion / Alert)
    - Title input
    - Message textarea
    - Link (optional)
    - Schedule option (Send now / Schedule for later)
    - Date/time picker
    - Channels: Email, SMS, Push, In-app (checkboxes)
    - Preview button
    - Send button
  - **Sent Notifications Table**:
    - Notification title
    - Type
    - Recipient type
    - Sent date
    - Channels used
    - Delivery status (Sent/Delivered/Failed)
    - Read count
    - Actions (View, Resend, Delete)
  - **Filter**: By type, recipient, date range
  - **Search**: By title or content
  - **Notification Detail Modal**: Full details + delivery report
  - Pagination
  - Export to CSV

#### 2.14 Admin Profile Settings
- **File**: `/src/app/pages/admin/AdminProfileSettings.tsx`
- **Route**: `/admin/settings`
- **Purpose**: Admin account settings
- **Features**:
  - **Profile Information Section**:
    - Admin name
    - Email (read-only)
    - Phone number
    - Profile photo upload
    - Role (Super Admin / Admin / Moderator)
    - Save button
  - **Security Section**:
    - Current password
    - New password
    - Confirm password
    - Password strength indicator
    - Two-factor authentication toggle
    - Save button
  - **Notification Preferences**:
    - Email notifications (toggle)
    - SMS notifications (toggle)
    - Types: New orders, New sellers, KYC requests, Returns, System alerts
    - Save button
  - **System Settings** (Super Admin only):
    - Platform commission rate (%)
    - Tax rate (%)
    - Minimum order value
    - Shipping charge
    - Save button
  - **Activity Log**: Recent admin activities with timestamps
  - **Session Management**: Active sessions list with "Log out all" button
  - Success/error messages
  - Form validation

---

### SECTION 3: SELLER PANEL (7 Pages) ⭐ NEW

#### 3.1 Seller Login Page
- **File**: `/src/app/pages/seller/SellerLoginPage.tsx`
- **Route**: `/seller/login`
- **Purpose**: Seller authentication
- **Features**:
  - Seller-specific branding (different from customer/admin)
  - Email/password form
  - "Remember me" checkbox
  - Forgot password link
  - "New seller? Register" link
  - Form validation
  - Error states (invalid credentials, account inactive)
  - Loading state
  - Grayscale design consistent with wireframe

#### 3.2 Seller Dashboard
- **File**: `/src/app/pages/seller/SellerDashboard.tsx`
- **Route**: `/seller`
- **Purpose**: Seller control panel and analytics
- **Features**:
  - **Revenue Summary Cards**:
    - Today's Revenue (with amount)
    - This Week (with amount)
    - This Month (with amount)
    - All Time (with amount)
  - **Orders Summary Cards**:
    - New Orders (count with badge)
    - Processing (count)
    - Shipped (count)
    - Delivered (count)
  - **Alert Widgets**:
    - Low Stock Alert (count of products < 10 stock)
    - Pending Returns (count)
  - **Revenue Graph**:
    - Line chart showing last 30 days
    - Toggle: 7 days / 30 days
    - Hover tooltips with exact values
  - **Recent Orders Table**:
    - Order ID
    - Customer name
    - Product
    - Amount
    - Status
    - Quick actions (View, Update Status)
    - "View All Orders" link
  - **Quick Action Buttons**:
    - Add New Product
    - View Inventory
    - Process Orders
    - View Reports
  - **Performance Metrics** (Small cards):
    - Total Products Listed
    - Conversion Rate (%)
    - Average Order Value
    - Customer Rating (out of 5)
  - **Top Selling Products Widget**:
    - Product name
    - Units sold
    - Revenue
    - Thumbnail image
  - Responsive grid layout (3 cols desktop, 1-2 cols mobile)

#### 3.3 Product Upload Page (6-Step Form)
- **File**: `/src/app/pages/seller/ProductUploadPage.tsx`
- **Route**: `/seller/products/new`
- **Purpose**: Add new products to inventory
- **Features**:
  - **Progress Indicator**: Shows current step (1/6, 2/6, etc.)
  
  - **Step 1: Basic Information**:
    - Product name (text input)
    - Description (textarea, 500 char limit)
    - Category (dropdown)
    - Sub-category (dropdown, dependent on category)
    - Brand (text input)
    - Next button
  
  - **Step 2: Pricing**:
    - MRP - Maximum Retail Price (number input)
    - Selling Price (number input)
    - Discount (auto-calculated and displayed: "X% off")
    - Validation: Selling price must be ≤ MRP
    - Previous & Next buttons
  
  - **Step 3: Variants**:
    - Size variants: Add sizes (S, M, L, XL, XXL) with stock quantity each
    - Color variants: Add colors (text or color picker) with stock quantity each
    - Option to add more variant types
    - Table showing all variants with stock
    - Previous & Next buttons
    - Option to "Skip" if no variants
  
  - **Step 4: Image Upload**:
    - Drag & drop zone
    - Browse files button
    - Multiple image upload (up to 5 images)
    - Image preview thumbnails
    - "Set as primary" option for main image
    - Remove image button for each
    - File size validation (< 2MB each)
    - Format validation (JPG, PNG only)
    - Previous & Next buttons
  
  - **Step 5: Shipping Details**:
    - Product weight (kg)
    - Dimensions (Length x Width x Height in cm)
    - Shipping charge (INR)
    - Free shipping toggle
    - Handling time (1-3 days dropdown)
    - Previous & Next buttons
  
  - **Step 6: Preview & Submit**:
    - Complete product summary
    - All details from steps 1-5
    - Image gallery preview
    - Variants table
    - Pricing breakdown
    - Shipping info
    - "Edit" buttons for each section (go back to that step)
    - "Save as Draft" button
    - "Submit for Approval" button (primary action)
    - Success modal after submit
    - Redirect to inventory after success
  
  - **Global Features**:
    - Form validation on each step
    - Can't proceed without required fields
    - Breadcrumb showing all steps
    - Data persists when navigating between steps
    - Auto-save to draft every 30 seconds
    - "Cancel" button (confirmation modal)
    - Mobile-responsive form layout

#### 3.4 Inventory Management Page
- **File**: `/src/app/pages/seller/InventoryManagementPage.tsx`
- **Route**: `/seller/inventory`
- **Purpose**: Manage product stock and listings
- **Features**:
  - **Filter Tabs**: All Products / In Stock / Low Stock (< 10) / Out of Stock
  - **Search Bar**: Search by product name or SKU
  - **Bulk Actions**:
    - Select all checkbox (in table header)
    - Update stock (opens modal)
    - Change status (Active/Inactive)
    - Delete products
    - Export to CSV
  - **Products Table**:
    - Checkbox (for bulk selection)
    - Product image (thumbnail)
    - Product name
    - SKU
    - Stock quantity (color-coded: green > 10, yellow 1-10, red 0)
    - Price
    - Status toggle (Active/Inactive)
    - Last updated date
    - Actions column:
      - Edit (opens product edit page)
      - Update stock (inline edit or modal)
      - View (product detail)
      - Delete (confirmation modal)
  - **Stock Badges**:
    - Low Stock badge (red) for qty < 10
    - Out of Stock badge (gray) for qty = 0
  - **Update Stock Modal**:
    - Product name display
    - Current stock display
    - New stock quantity input
    - Reason for change (optional)
    - Save button
  - **Bulk Update Modal**:
    - Selected products list
    - New stock quantity input
    - Apply to all selected
    - Individual adjustments
    - Save all button
  - **CSV Upload**:
    - Download sample CSV template
    - Upload CSV file
    - Validation and preview
    - Import button
    - Success/error messages
  - **Pagination**: 20 products per page
  - **Empty State**: "No products found" with "Add Product" button
  - **Mobile-responsive table** (cards on mobile)

#### 3.5 Seller Order Management Page
- **File**: `/src/app/pages/seller/SellerOrderManagementPage.tsx`
- **Route**: `/seller/orders`
- **Purpose**: Process and track orders
- **Features**:
  - **Filter Tabs with Badge Counts**:
    - New Orders (badge with count, e.g., "5")
    - Processing (count)
    - Shipped (count)
    - Delivered (count)
    - Cancelled (count)
  - **Date Range Filter**: Dropdown (Today, Yesterday, Last 7/30 days, Custom)
  - **Search Bar**: By order ID or customer name
  - **Orders Table**:
    - Checkbox (for bulk actions)
    - Order ID (clickable to view details)
    - Customer name
    - Product(s) - with thumbnail
    - Order date
    - Amount (INR)
    - Status (badge with color: blue=new, yellow=processing, green=shipped, gray=delivered)
    - Actions:
      - View Details
      - Update Status
      - Add Tracking
      - Print Invoice
  - **Bulk Actions**:
    - Update status (modal with status dropdown)
    - Print invoices
    - Export to CSV
  - **Order Detail Modal**:
    - Full order information
    - Customer details
    - Product details
    - Delivery address
    - Payment information
    - Order timeline
    - Close button
  - **Update Status Dropdown**:
    - Options: Processing, Shipped, Delivered, Cancelled
    - Save button
    - Status change reflected immediately
  - **Add Tracking ID Modal**:
    - Courier/Carrier name (dropdown: BlueDart, DTDC, Delhivery, etc.)
    - Tracking ID input
    - Expected delivery date picker
    - Save button
    - Customer receives notification
  - **Print Invoice Button**:
    - Opens print-friendly invoice page
    - Includes: Order details, seller info, customer info, products, pricing
    - Print dialog (Ctrl+P / Cmd+P)
  - **Pagination**: 20 orders per page
  - **Empty State**: "No orders yet" with illustration
  - **Status Color Coding**:
    - New: Blue background
    - Processing: Yellow background
    - Shipped: Purple background
    - Delivered: Green background
    - Cancelled: Red background
  - Mobile-responsive (cards on mobile)

#### 3.6 Seller Reports & Analytics Page
- **File**: `/src/app/pages/seller/SellerReportsPage.tsx`
- **Route**: `/seller/reports`
- **Purpose**: View performance metrics and reports
- **Features**:
  - **Date Range Selector**: Dropdown (Today, Yesterday, Last 7/30/90 days, Custom date picker)
  - **Comparison Toggle**: Compare with previous period (shows % change)
  
  - **Key Metrics Cards** (4 cards):
    - Total Revenue:
      - Amount (INR)
      - % change vs previous period
      - Up/down arrow indicator (green/red)
    - Total Orders:
      - Count
      - % change
      - Indicator
    - Average Order Value:
      - Amount (INR)
      - % change
      - Indicator
    - Conversion Rate:
      - Percentage
      - % change
      - Indicator
  
  - **Revenue Chart**:
    - Line chart showing revenue trend
    - X-axis: Date
    - Y-axis: Revenue
    - Hover tooltip with exact value
    - Toggle: Daily / Weekly / Monthly view
    - Smooth line animation
  
  - **Top Selling Products Table**:
    - Product name (with thumbnail)
    - Units sold
    - Revenue (INR)
    - Percentage of total revenue
    - Top 10 products
  
  - **Category-wise Sales**:
    - Pie chart placeholder (labeled boxes in grayscale)
    - Legend with category names and percentages
  
  - **Order Status Distribution**:
    - Bar chart showing count of orders by status
    - Bars: New, Processing, Shipped, Delivered, Cancelled
  
  - **Payment Method Breakdown**:
    - Table showing:
      - Payment method
      - Order count
      - Revenue
      - Percentage
    - Methods: Credit/Debit Card, UPI, Net Banking, COD, Wallet
  
  - **Export Report Section**:
    - "Export Report" button
    - Format options: CSV / PDF
    - Exports data based on current date range and filters
  
  - **Additional Insights**:
    - Best selling day of the week
    - Peak order time
    - Repeat customer rate
  
  - Responsive layout (stacked on mobile)

#### 3.7 Seller Account Settings Page
- **File**: `/src/app/pages/seller/SellerSettingsPage.tsx`
- **Route**: `/seller/settings`
- **Purpose**: Manage seller account and preferences
- **Features**:
  
  - **Business Information Section**:
    - Business name (text input)
    - Business type (dropdown: Sole Proprietorship, Partnership, Private Ltd, etc.)
    - GST number (text input, validation)
    - PAN number (text input, validation)
    - Business address:
      - Street address
      - City
      - State (dropdown)
      - Pincode
      - Country
    - "Save Changes" button
  
  - **Bank Details Section**:
    - Account holder name (text input)
    - Bank name (text input)
    - Account number (text input, masked)
    - Confirm account number (validation)
    - IFSC code (text input, validation)
    - Account type (dropdown: Savings / Current)
    - Branch name (text input)
    - "Save Changes" button
    - Security note: "Your bank details are encrypted and secure"
  
  - **Pickup Address Section** (for shipping):
    - Warehouse/store name
    - Contact person name
    - Contact phone (10 digits validation)
    - Address (similar to business address)
    - Pickup availability:
      - Days (Monday - Sunday checkboxes)
      - Hours (From time - To time)
    - "Save Changes" button
  
  - **Notification Preferences Section**:
    - Email notifications (toggle switch)
    - SMS notifications (toggle switch)
    - Push notifications (toggle switch)
    - Notification types (checkboxes):
      - New orders
      - Low stock alerts
      - Return requests
      - Payment settlements
      - Policy updates
    - "Save Preferences" button
  
  - **Store Settings Section**:
    - Store name/Brand name
    - Store description (textarea)
    - Store logo upload (drag & drop or browse)
    - Logo preview
    - Store banner upload
    - Banner preview
    - Store URL slug (markethub.com/store/[slug])
    - "Save Changes" button
  
  - **Change Password Section**:
    - Current password (password input)
    - New password (password input)
    - Confirm new password (password input)
    - Password strength indicator (weak/medium/strong)
    - "Update Password" button
  
  - **Account Status Section**:
    - Account active since: [Date]
    - KYC status: [Approved/Pending/Rejected]
    - Verification badge if approved
    - Total products listed
    - Total orders fulfilled
  
  - **Global Features**:
    - Each section has individual "Save" button
    - Form validation
    - Success toast messages ("Settings updated successfully!")
    - Error handling
    - Loading states during save
    - Confirmation dialog for sensitive changes
    - "Discard changes" option if fields modified but not saved
  
  - Mobile-responsive (stacked sections, full-width inputs)

---

### SECTION 4: UTILITY PAGES (1 Page)

#### 4.1 PDF Export Page ⭐
- **File**: `/src/app/pages/PDFExportPage.tsx`
- **Route**: `/pdf-export`
- **Purpose**: Export all pages to PDF document
- **Features**:
  - **Print Button**: Fixed top-right, triggers print dialog (hidden in print)
  - **Cover Page**:
    - MarketHub logo (MH in box)
    - Project title
    - Subtitle: "Multi-Vendor E-Commerce Marketplace"
    - Page count: "37 Pages"
    - Section breakdown: "Customer Portal + Seller Panel + Admin Dashboard"
    - Generation date
    - Version number
  - **Table of Contents Page**:
    - 3 sections listed:
      - Customer E-Commerce (16 pages)
      - Admin Dashboard (14 pages)
      - Seller Panel (7 pages)
    - Page numbers for each
    - Legend (⭐ = Enhanced features)
  - **Section Dividers**: Full-page dark backgrounds with section name and count
  - **All 37 Pages Rendered**:
    - Each page in PageSection component
    - Page title header
    - Page content (actual component rendered)
    - Border around each page
  - **End Page**:
    - Logo
    - "End of Documentation"
    - Page count
    - Implementation status (70% complete)
    - Copyright notice
  - **Print Styles** (`/src/styles/print.css`):
    - Page breaks before each section
    - Hide navigation, buttons
    - Optimize for print
  - **Browser Print Dialog**:
    - Save as PDF option
    - Portrait orientation
    - Enable background graphics

---

## 🎨 Design System

All 37 pages follow consistent design principles:

### Color Palette (Grayscale Only)
```
- White:     #FFFFFF (backgrounds, cards)
- Gray-100:  #F3F4F6 (page backgrounds, input fields)
- Gray-200:  #E5E7EB (table headers, accents)
- Gray-300:  #D1D5DB (borders, dividers)
- Gray-400:  #9CA3AF (main borders - 2px)
- Gray-500:  #6B7280 (secondary text)
- Gray-600:  #4B5563 (tertiary text)
- Gray-700:  #374151 (buttons, dark elements)
- Gray-800:  #1F2937 (button borders)
- Gray-900:  #111827 (primary text)
```

### Typography
- **Headings**: Bold, uppercase, gray-900
- **Labels**: Bold, 0.75rem - 0.875rem, gray-700
- **Body**: Regular, 0.875rem - 1rem, gray-600
- **Small**: 0.75rem, gray-500

### Borders
- **Standard**: 2px solid
- **Color**: Gray-400 (#9CA3AF)
- **Applied to**: All containers, cards, tables, forms, buttons

### Spacing
- **Base unit**: 8px (0.5rem)
- **Section padding**: 32px (p-8)
- **Card padding**: 24px (p-6)
- **Element gaps**: 16px (gap-4), 24px (gap-6)

### Components
- **Buttons**: Gray-700 background, 2px border, hover state
- **Cards**: White background, gray-400 border
- **Tables**: Gray-200 headers, striped rows
- **Forms**: Gray-100 inputs, gray-400 borders
- **Modals**: White with shadow, overlay backdrop

### Responsive Breakpoints
- **Mobile**: < 768px (1-2 columns)
- **Tablet**: 768px - 1024px (2-3 columns)
- **Desktop**: > 1024px (3-4 columns)
- **Max width**: 1440px

---

## 🗺️ Routing Structure

### Customer Routes (RootLayout)
All customer-facing pages use `/src/app/layouts/RootLayout.tsx` with header and footer.

### Admin Routes (AdminLayout)
All admin pages use `/src/app/layouts/AdminLayout.tsx` with admin sidebar and header.

### Seller Routes (SellerLayout)
All seller pages use `/src/app/layouts/SellerLayout.tsx` with seller sidebar and navigation.

---

## 📂 File Organization

```
/src/app
├── /pages
│   ├── [16 customer pages]
│   ├── /admin/[14 admin pages]
│   ├── /seller/[7 seller pages]
│   └── PDFExportPage.tsx
├── /layouts
│   ├── RootLayout.tsx
│   ├── AdminLayout.tsx
│   └── SellerLayout.tsx
├── /components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── /admin/[admin components]
├── App.tsx
└── routes.tsx (38 routes configured)
```

---

## 🎯 Usage Guide

### For Developers
1. Reference this guide to understand page structure
2. Use file paths to locate and edit pages
3. Follow design system for consistency
4. Check routing structure for navigation

### For Designers
1. Use as reference for wireframe → hi-fi conversion
2. Extract layout patterns and spacing
3. Reference feature lists for completeness
4. Use for component specifications

### For Stakeholders
1. Navigate to `/pdf-export` to generate PDF
2. Review all 37 pages in single document
3. Use for project planning and scope discussions
4. Reference for feature completeness

### For Documentation
1. Include in project handoff
2. Archive for project history
3. Use in design system documentation
4. Reference for technical specifications

---

## 📊 Completion Checklist

### Completed ✅
- [x] 16 Customer pages (including 2 enhanced versions)
- [x] 14 Admin pages
- [x] 7 Seller pages
- [x] 3 Layouts (Root, Admin, Seller)
- [x] 38 Routes configured
- [x] PDF export functionality
- [x] Error boundaries
- [x] 404 handling
- [x] Responsive design
- [x] Form validation
- [x] Loading states
- [x] Empty states
- [x] Modal interactions
- [x] Table pagination
- [x] Search functionality
- [x] Filter functionality
- [x] Bulk actions
- [x] Export features

### Remaining ⏳
- [ ] Cart enhancements (save for later, cross-sell)
- [ ] Checkout improvements (guest checkout, payment retry)
- [ ] Mobile-specific components (bottom nav, sticky cart)

---

## 🎊 Summary

**Total Pages Built**: 37  
**Total Routes**: 38  
**Completion Status**: 70% (7 of 10 modules)  
**PDF Export**: Available at `/pdf-export`  
**Last Updated**: February 20, 2026  
**Version**: 2.0.0

---

**Document End** | MarketHub E-Commerce Marketplace | © 2026
