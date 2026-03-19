# Firebase Firestore Database Plan - E-Commerce Application

## Document Overview
This document outlines the complete Firestore database structure, data modeling strategy, and implementation guidelines for the e-commerce Android application.

---

## Table of Contents
1. [Database Architecture Overview](#1-database-architecture-overview)
2. [Collections Structure](#2-collections-structure)
3. [Data Models & Schema](#3-data-models--schema)
4. [Relationships & References](#4-relationships--references)
5. [Indexes & Query Optimization](#5-indexes--query-optimization)
6. [Security Rules](#6-security-rules)
7. [Data Validation](#7-data-validation)
8. [Scalability Considerations](#8-scalability-considerations)
9. [Backup & Recovery](#9-backup--recovery)
10. [Migration Strategy](#10-migration-strategy)

---

## 1. Database Architecture Overview

### 1.1 Firestore Database Structure Philosophy

**Why Firestore?**
- Real-time synchronization across devices
- Offline support (works without internet, syncs when online)
- Automatic scaling (handles millions of users)
- Strong consistency (data is always accurate)
- Flexible querying with indexes

**Key Design Principles:**
1. **Denormalization**: Store related data together to reduce reads (saves money and improves speed)
2. **Shallow Queries**: Firestore doesn't query nested data deeply, so we structure accordingly
3. **Read-Optimized**: E-commerce apps read data more than write, so we optimize for fast reads
4. **Document Size Limits**: Keep documents under 1MB (Firestore limit)
5. **Cost-Effective**: Minimize read/write operations to reduce Firebase costs

### 1.2 Database Naming Conventions

**Collections**: Plural, lowercase with underscores
- Example: `users`, `products`, `orders`, `product_reviews`

**Document IDs**: 
- Auto-generated (recommended for most): Firestore auto-ID
- Custom IDs for specific cases: Use meaningful identifiers (e.g., `userId`, `orderId`)

**Fields**: camelCase for consistency
- Example: `firstName`, `productName`, `createdAt`, `shippingAddress`

### 1.3 Timestamp Standards

All timestamps should use **Firestore Server Timestamp** to ensure consistency:
```
FieldValue.serverTimestamp()
```

Fields to include in most documents:
- `createdAt`: When the document was created
- `updatedAt`: When the document was last modified
- `deletedAt`: Soft delete timestamp (instead of actually deleting)

---

## 2. Collections Structure

### 2.1 Top-Level Collections

```
/users                          # User profiles and authentication data
/products                       # Product catalog
/categories                     # Product categories and hierarchy
/orders                         # Customer orders
/carts                          # Shopping carts (per user)
/wishlists                      # User wishlists
/product_reviews               # Product reviews and ratings
/addresses                      # Saved shipping addresses
/payment_methods               # Saved payment methods (tokenized)
/coupons                       # Discount coupons and promotions
/notifications                  # User notifications
/app_config                    # App-wide configuration
/analytics_events              # Custom analytics events (optional)
/support_tickets               # Customer support tickets
/search_history                # User search history (optional)
/recently_viewed               # Recently viewed products per user
/inventory_logs                # Stock movement logs (optional)
/refunds                       # Refund requests and processing
/shipping_zones                # Shipping rates by location
/vendor_info                   # Vendor/seller information (if marketplace)
```

### 2.2 Subcollections vs Root Collections

**When to use Subcollections:**
- Data that only makes sense in context of parent (e.g., order items under an order)
- Data that needs to be deleted with parent
- Data that has clear one-to-many relationships

**When to use Root Collections:**
- Data accessed independently (e.g., products)
- Data shared across multiple entities
- Data requiring complex queries across multiple parents

---

## 3. Data Models & Schema

### 3.1 Users Collection

**Collection Path**: `/users/{userId}`

**Purpose**: Store user profile information, preferences, and metadata

**Document Structure**:
```javascript
{
  // Basic Information
  userId: "auto-generated-id",              // Matches Firebase Auth UID
  email: "user@example.com",
  phoneNumber: "+1234567890",
  phoneVerified: true,
  
  // Profile Details
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  profileImageUrl: "https://storage.../profile.jpg",
  dateOfBirth: "1990-05-15",                // String format: YYYY-MM-DD
  gender: "male",                            // male/female/other/prefer_not_to_say
  
  // Account Status
  accountStatus: "active",                   // active/suspended/deleted
  emailVerified: true,
  isGuest: false,
  
  // User Role
  role: "customer",                          // customer/admin/vendor/support
  
  // Preferences
  preferences: {
    language: "en",                          // Language preference
    currency: "USD",                         // Preferred currency
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newsletter: true,
    theme: "light"                           // light/dark/auto
  },
  
  // Default Addresses (for quick access)
  defaultShippingAddressId: "address_id_123",
  defaultBillingAddressId: "address_id_456",
  
  // Loyalty & Rewards
  loyaltyPoints: 150,
  rewardsTier: "silver",                     // bronze/silver/gold/platinum
  referralCode: "JOHN2024",                  // User's unique referral code
  referredBy: "userId_of_referrer",          // Who referred this user
  
  // Statistics (denormalized for quick access)
  totalOrders: 12,
  totalSpent: 1245.50,
  averageOrderValue: 103.79,
  lifetimeValue: 1245.50,
  lastOrderDate: Timestamp,
  
  // Metadata
  registrationSource: "android_app",         // android_app/ios_app/web/admin
  registrationIp: "192.168.1.1",
  lastLoginAt: Timestamp,
  lastLoginIp: "192.168.1.1",
  deviceTokens: ["fcm_token_1", "fcm_token_2"], // For push notifications
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  deletedAt: null                            // Soft delete
}
```

**Subcollections**:
- `/users/{userId}/addresses` - Saved shipping/billing addresses
- `/users/{userId}/payment_methods` - Saved payment methods
- `/users/{userId}/orders` - User's order history (duplicate for easy access)
- `/users/{userId}/notifications` - User-specific notifications
- `/users/{userId}/recently_viewed` - Recently viewed products
- `/users/{userId}/search_history` - Search queries

### 3.2 Products Collection

**Collection Path**: `/products/{productId}`

**Purpose**: Store complete product catalog information

**Document Structure**:
```javascript
{
  // Basic Information
  productId: "prod_auto_id",
  sku: "TEE-BLU-M-001",                      // Stock Keeping Unit
  name: "Classic Blue T-Shirt",
  slug: "classic-blue-tshirt",               // URL-friendly name
  
  // Description
  shortDescription: "Comfortable cotton t-shirt...",
  longDescription: "This premium quality t-shirt is made from 100% organic cotton...",
  
  // Categorization
  categoryId: "cat_clothing",
  categoryName: "Clothing",                  // Denormalized for quick display
  categoryPath: ["Clothing", "Men", "T-Shirts"], // Breadcrumb trail
  subCategoryId: "subcat_tshirts",
  
  tags: ["casual", "summer", "cotton", "basic"], // For search and filtering
  
  // Pricing
  pricing: {
    basePrice: 29.99,
    salePrice: 24.99,                        // null if not on sale
    costPrice: 15.00,                        // Purchase cost (for margin calculation)
    currency: "USD",
    discount: {
      percentage: 17,                        // Calculated: ((basePrice - salePrice) / basePrice) * 100
      amount: 5.00,
      type: "percentage",                    // percentage/fixed/bogo
      validFrom: Timestamp,
      validUntil: Timestamp
    },
    taxRate: 0.08,                           // 8% tax
    taxIncluded: false                       // Is tax included in price?
  },
  
  // Inventory
  inventory: {
    stockQuantity: 150,
    lowStockThreshold: 10,                   // Alert when stock falls below this
    stockStatus: "in_stock",                 // in_stock/low_stock/out_of_stock/pre_order
    allowBackorder: false,                   // Can customers order when out of stock?
    trackInventory: true,                    // Should we track stock for this product?
    reservedQuantity: 5                      // Items in carts but not yet ordered
  },
  
  // Variants (Colors, Sizes, etc.)
  hasVariants: true,
  variants: [
    {
      variantId: "var_001",
      sku: "TEE-BLU-S-001",
      name: "Small / Blue",
      attributes: {
        size: "S",
        color: "Blue",
        colorHex: "#0000FF"
      },
      price: 29.99,
      stockQuantity: 50,
      stockStatus: "in_stock",
      imageUrl: "https://storage.../blue-s.jpg",
      weight: 0.2,                           // in kg
      dimensions: {
        length: 25,                          // in cm
        width: 20,
        height: 2
      }
    },
    {
      variantId: "var_002",
      sku: "TEE-BLU-M-001",
      name: "Medium / Blue",
      attributes: {
        size: "M",
        color: "Blue",
        colorHex: "#0000FF"
      },
      price: 29.99,
      stockQuantity: 75,
      stockStatus: "in_stock",
      imageUrl: "https://storage.../blue-m.jpg",
      weight: 0.25,
      dimensions: {
        length: 27,
        width: 22,
        height: 2
      }
    }
    // ... more variants
  ],
  
  // Images
  images: [
    {
      url: "https://storage.../product-main.jpg",
      thumbnailUrl: "https://storage.../product-main-thumb.jpg",
      alt: "Classic Blue T-Shirt Front View",
      isPrimary: true,
      order: 0
    },
    {
      url: "https://storage.../product-back.jpg",
      thumbnailUrl: "https://storage.../product-back-thumb.jpg",
      alt: "Classic Blue T-Shirt Back View",
      isPrimary: false,
      order: 1
    }
  ],
  primaryImageUrl: "https://storage.../product-main.jpg", // Denormalized
  
  // Ratings & Reviews
  ratings: {
    averageRating: 4.5,                      // Calculated average
    totalReviews: 128,
    ratingDistribution: {
      5: 80,                                 // 80 five-star reviews
      4: 30,
      3: 10,
      2: 5,
      1: 3
    }
  },
  
  // SEO & Marketing
  seo: {
    metaTitle: "Classic Blue T-Shirt - Comfortable & Stylish",
    metaDescription: "Shop our premium blue t-shirt...",
    keywords: ["blue t-shirt", "cotton tshirt", "casual wear"],
    ogImageUrl: "https://storage.../og-image.jpg"
  },
  
  // Shipping
  shipping: {
    weight: 0.25,                            // in kg
    dimensions: {
      length: 30,                            // in cm
      width: 25,
      height: 5
    },
    shippingClass: "standard",               // standard/express/heavy/fragile
    freeShipping: false,
    estimatedDeliveryDays: "3-5"
  },
  
  // Product Status
  status: "published",                       // draft/published/archived/discontinued
  visibility: "public",                      // public/private/hidden
  featured: true,                            // Show on homepage/featured sections
  trending: false,                           // Trending product badge
  newArrival: true,                          // New arrival badge
  bestSeller: false,                         // Best seller badge
  
  // Vendor/Seller (if marketplace)
  vendorId: "vendor_123",
  vendorName: "Fashion Store Inc",           // Denormalized
  vendorRating: 4.7,
  
  // Product Attributes (flexible key-value pairs)
  attributes: {
    material: "100% Organic Cotton",
    careInstructions: "Machine wash cold",
    brand: "EcoWear",
    manufacturer: "Green Textiles Ltd",
    countryOfOrigin: "USA",
    season: "All Season",
    style: "Casual",
    neckline: "Round Neck",
    sleeveType: "Short Sleeve",
    fit: "Regular Fit"
  },
  
  // Related Products (for recommendations)
  relatedProductIds: ["prod_002", "prod_045", "prod_089"],
  
  // Statistics (updated periodically via Cloud Functions)
  statistics: {
    viewCount: 1250,
    addToCartCount: 320,
    purchaseCount: 156,
    wishlistCount: 89,
    shareCount: 23,
    conversionRate: 12.48                    // (purchaseCount / viewCount) * 100
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  publishedAt: Timestamp,
  deletedAt: null
}
```

**Indexes Needed** (for efficient queries):
- `categoryId` + `status`
- `categoryId` + `pricing.salePrice` (for sorting by price)
- `status` + `featured` + `createdAt`
- `tags` (array-contains) + `status`
- `vendorId` + `status`

### 3.3 Categories Collection

**Collection Path**: `/categories/{categoryId}`

**Purpose**: Organize products into hierarchical categories

**Document Structure**:
```javascript
{
  categoryId: "cat_auto_id",
  name: "Men's Clothing",
  slug: "mens-clothing",
  description: "Explore our collection of men's clothing...",
  
  // Hierarchy
  parentCategoryId: null,                    // null for root categories
  level: 0,                                  // 0 = root, 1 = subcategory, etc.
  path: ["Clothing", "Men"],                 // Full path for breadcrumbs
  
  // Display
  imageUrl: "https://storage.../category.jpg",
  iconUrl: "https://storage.../icon.svg",
  bannerUrl: "https://storage.../banner.jpg",
  colorCode: "#FF5733",                      // For UI theming
  
  // Ordering
  displayOrder: 1,                           // For sorting in UI
  featured: true,                            // Show on homepage
  
  // Statistics (denormalized)
  productCount: 245,                         // Total products in this category
  
  // SEO
  seo: {
    metaTitle: "Men's Clothing - Shop Latest Fashion",
    metaDescription: "Browse our extensive collection...",
    keywords: ["mens clothing", "fashion", "apparel"]
  },
  
  // Status
  status: "active",                          // active/inactive/hidden
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Subcollections**:
- `/categories/{categoryId}/subcategories` - Child categories (alternative structure)

### 3.4 Orders Collection

**Collection Path**: `/orders/{orderId}`

**Purpose**: Store customer orders with complete transaction details

**Document Structure**:
```javascript
{
  // Order Identification
  orderId: "ORD-2024-001234",                // Human-readable order ID
  orderNumber: "001234",                     // Sequential number
  
  // Customer Information
  userId: "user_id_123",
  customerInfo: {                            // Denormalized snapshot
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  
  // Order Items
  items: [
    {
      itemId: "item_001",
      productId: "prod_123",
      productName: "Classic Blue T-Shirt",   // Snapshot at time of order
      productSlug: "classic-blue-tshirt",
      sku: "TEE-BLU-M-001",
      variantId: "var_002",
      variantName: "Medium / Blue",
      imageUrl: "https://storage.../product.jpg",
      
      // Pricing at time of order
      unitPrice: 24.99,
      originalPrice: 29.99,                  // Before discount
      quantity: 2,
      subtotal: 49.98,                       // unitPrice * quantity
      
      tax: 3.99,
      taxRate: 0.08,
      discount: 10.00,
      discountType: "coupon",                // coupon/sale/bulk
      total: 43.97,                          // subtotal + tax - discount
      
      // Vendor (if marketplace)
      vendorId: "vendor_123",
      vendorName: "Fashion Store Inc",
      
      // Status tracking
      status: "processing",                  // pending/processing/shipped/delivered/cancelled/returned
      
      // Shipping tracking (if shipped separately)
      trackingNumber: null,
      carrier: null
    }
    // ... more items
  ],
  
  // Pricing Summary
  pricing: {
    subtotal: 49.98,                         // Sum of all item subtotals
    shippingCost: 5.99,
    tax: 4.48,
    discount: 10.00,
    couponDiscount: 5.00,
    loyaltyPointsUsed: 500,
    loyaltyPointsValue: 5.00,
    total: 45.45,                            // Final amount charged
    currency: "USD"
  },
  
  // Coupon/Discount
  coupon: {
    code: "SAVE10",
    discountType: "percentage",              // percentage/fixed/free_shipping
    discountValue: 10,                       // 10% or $10
    appliedDiscount: 5.00
  },
  
  // Shipping Information
  shippingAddress: {
    addressId: "addr_123",
    fullName: "John Doe",
    phone: "+1234567890",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10001",
    latitude: 40.7128,                       // For delivery tracking
    longitude: -74.0060,
    addressType: "home"                      // home/office/other
  },
  
  // Billing Information
  billingAddress: {
    // Same structure as shippingAddress
    // If same as shipping, can reference or duplicate
    sameAsShipping: true,
    // ... address fields
  },
  
  // Shipping Details
  shipping: {
    method: "standard",                      // standard/express/overnight/same_day
    carrier: "FedEx",
    trackingNumber: "1234567890",
    trackingUrl: "https://fedex.com/track/...",
    estimatedDeliveryDate: Timestamp,
    actualDeliveryDate: null,
    shippingCost: 5.99,
    
    // Delivery preferences
    leaveAtDoor: false,
    signatureRequired: true,
    deliveryInstructions: "Ring doorbell"
  },
  
  // Payment Information
  payment: {
    method: "credit_card",                   // credit_card/debit_card/paypal/upi/cod/wallet
    provider: "stripe",                      // stripe/razorpay/paypal
    transactionId: "txn_abc123",
    
    // Card info (tokenized, never store actual card numbers)
    cardLast4: "4242",
    cardBrand: "Visa",
    cardType: "credit",
    
    status: "completed",                     // pending/processing/completed/failed/refunded
    paidAt: Timestamp,
    
    // Refund information (if applicable)
    refund: {
      refundId: "ref_123",
      amount: 45.45,
      reason: "Customer request",
      status: "processed",
      requestedAt: Timestamp,
      processedAt: Timestamp
    }
  },
  
  // Order Status
  status: "processing",                      // pending/confirmed/processing/shipped/out_for_delivery/delivered/cancelled/returned/refunded
  
  // Status History (timeline)
  statusHistory: [
    {
      status: "pending",
      timestamp: Timestamp,
      note: "Order placed by customer",
      updatedBy: "system"
    },
    {
      status: "confirmed",
      timestamp: Timestamp,
      note: "Payment verified",
      updatedBy: "system"
    },
    {
      status: "processing",
      timestamp: Timestamp,
      note: "Order being prepared",
      updatedBy: "admin_user_123"
    }
    // ... more status updates
  ],
  
  // Customer Notes
  customerNote: "Please gift wrap this order",
  
  // Internal Notes (not visible to customer)
  internalNotes: "VIP customer - priority processing",
  
  // Gift Options
  isGift: true,
  giftMessage: "Happy Birthday! Love, Mom",
  giftWrapping: true,
  
  // Notifications Sent
  notificationsSent: {
    orderConfirmation: true,
    paymentConfirmation: true,
    shipped: true,
    outForDelivery: false,
    delivered: false
  },
  
  // Invoice
  invoiceNumber: "INV-2024-001234",
  invoiceUrl: "https://storage.../invoices/001234.pdf",
  
  // Return/Refund
  returnEligible: true,
  returnWindow: Timestamp,                   // Date until return is allowed
  
  // Source
  orderSource: "android_app",                // android_app/ios_app/web/admin
  deviceInfo: "Samsung Galaxy S21",
  appVersion: "1.2.0",
  
  // IP Address (for fraud detection)
  ipAddress: "192.168.1.1",
  
  // Timestamps
  createdAt: Timestamp,                      // Order placed at
  updatedAt: Timestamp,
  confirmedAt: Timestamp,
  shippedAt: Timestamp,
  deliveredAt: Timestamp,
  cancelledAt: null,
  completedAt: null                          // Order fully completed (delivered/returned/refunded)
}
```

**Indexes Needed**:
- `userId` + `createdAt` (desc)
- `userId` + `status`
- `status` + `createdAt`
- `orderNumber` (unique)
- `payment.transactionId`

**Subcollections**:
- `/orders/{orderId}/tracking_updates` - Detailed tracking history
- `/orders/{orderId}/communications` - Customer service messages

### 3.5 Carts Collection

**Collection Path**: `/carts/{userId}`

**Purpose**: Store user's shopping cart items

**Document Structure**:
```javascript
{
  userId: "user_id_123",
  
  // Cart Items
  items: [
    {
      cartItemId: "cart_item_001",
      productId: "prod_123",
      productName: "Classic Blue T-Shirt",
      productSlug: "classic-blue-tshirt",
      variantId: "var_002",
      variantName: "Medium / Blue",
      sku: "TEE-BLU-M-001",
      
      // Pricing (current/live prices)
      unitPrice: 24.99,
      originalPrice: 29.99,
      quantity: 2,
      subtotal: 49.98,
      
      // Product details for display
      imageUrl: "https://storage.../product.jpg",
      
      // Stock check
      inStock: true,
      availableQuantity: 75,
      
      // Vendor
      vendorId: "vendor_123",
      
      // Timestamps
      addedAt: Timestamp,
      updatedAt: Timestamp
    }
    // ... more items
  ],
  
  // Cart Summary
  summary: {
    itemCount: 3,                            // Total number of items
    uniqueItemCount: 2,                      // Number of different products
    subtotal: 74.97,
    estimatedTax: 6.00,
    estimatedShipping: 5.99,
    estimatedTotal: 86.96,
    currency: "USD"
  },
  
  // Applied Coupon
  appliedCoupon: {
    code: "SAVE10",
    discountAmount: 7.50,
    appliedAt: Timestamp
  },
  
  // Cart Status
  status: "active",                          // active/abandoned/converted/expired
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  expiresAt: Timestamp,                      // Auto-delete old carts (e.g., after 30 days)
  lastActivityAt: Timestamp                  // For abandoned cart detection
}
```

**Note**: Cart can also be structured as subcollection under users:
- `/users/{userId}/cart/items/{cartItemId}`

### 3.6 Wishlists Collection

**Collection Path**: `/wishlists/{userId}` or `/users/{userId}/wishlist/{productId}`

**Purpose**: Store user's favorite/saved products

**Document Structure**:
```javascript
{
  userId: "user_id_123",
  
  items: [
    {
      wishlistItemId: "wish_001",
      productId: "prod_456",
      productName: "Summer Dress",
      productSlug: "summer-dress",
      variantId: "var_010",
      
      // Current product info (denormalized)
      currentPrice: 49.99,
      originalPrice: 69.99,
      onSale: true,
      imageUrl: "https://storage.../dress.jpg",
      inStock: true,
      
      // Price tracking
      priceWhenAdded: 59.99,
      priceDropAlert: true,                  // Notify if price drops
      backInStockAlert: true,                // Notify if back in stock
      
      // Timestamps
      addedAt: Timestamp
    }
    // ... more items
  ],
  
  // Wishlist Metadata
  totalItems: 8,
  isPublic: false,                           // Can others see this wishlist?
  shareableLink: "https://app.com/wishlist/abc123",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3.7 Product Reviews Collection

**Collection Path**: `/product_reviews/{reviewId}`

**Purpose**: Store customer reviews and ratings

**Document Structure**:
```javascript
{
  reviewId: "review_auto_id",
  
  // Product & User Info
  productId: "prod_123",
  productName: "Classic Blue T-Shirt",       // Snapshot
  userId: "user_id_123",
  userName: "John D.",                       // Public display name
  userProfileImage: "https://storage.../profile.jpg",
  
  // Verified Purchase
  verifiedPurchase: true,                    // Did user actually buy this?
  orderId: "ord_001234",                     // Reference to order
  
  // Rating
  rating: 5,                                 // 1-5 stars
  
  // Review Content
  title: "Excellent quality!",
  reviewText: "This t-shirt is amazing. The fabric is soft and comfortable...",
  
  // Images/Videos
  media: [
    {
      type: "image",                         // image/video
      url: "https://storage.../review-img-1.jpg",
      thumbnailUrl: "https://storage.../review-img-1-thumb.jpg"
    }
  ],
  
  // Review Attributes (optional structured ratings)
  attributes: {
    quality: 5,
    valueForMoney: 4,
    fitAccuracy: 5                           // True to size?
  },
  
  // Recommendation
  wouldRecommend: true,                      // Yes/No
  
  // Helpful Votes
  helpfulCount: 12,                          // Users who found this helpful
  notHelpfulCount: 1,
  
  // Moderation
  status: "approved",                        // pending/approved/rejected/flagged
  moderatedBy: "admin_user_456",
  moderatedAt: Timestamp,
  rejectionReason: null,
  
  // Flagging
  flagged: false,
  flagCount: 0,
  flagReasons: [],
  
  // Vendor Response
  vendorResponse: {
    responseText: "Thank you for your feedback!",
    respondedBy: "vendor_123",
    respondedAt: Timestamp
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  deletedAt: null
}
```

**Indexes Needed**:
- `productId` + `status` + `createdAt` (desc)
- `userId` + `createdAt`
- `status` + `rating`

### 3.8 Addresses Collection

**Collection Path**: `/users/{userId}/addresses/{addressId}`

**Purpose**: Store user's saved shipping and billing addresses

**Document Structure**:
```javascript
{
  addressId: "addr_auto_id",
  userId: "user_id_123",
  
  // Address Type
  type: "shipping",                          // shipping/billing/both
  label: "Home",                             // Home/Office/Other/custom label
  
  // Contact Information
  fullName: "John Doe",
  phone: "+1234567890",
  alternatePhone: "+0987654321",
  email: "john@example.com",                 // Optional
  
  // Address Details
  addressLine1: "123 Main Street",
  addressLine2: "Apartment 4B",              // Optional
  landmark: "Near Central Park",             // Optional, helpful for delivery
  city: "New York",
  state: "New York",
  stateCode: "NY",
  country: "United States",
  countryCode: "US",
  postalCode: "10001",
  
  // Geolocation (for delivery optimization)
  location: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  
  // Address Validation
  validated: true,                           // Address verified via API
  validatedAt: Timestamp,
  
  // Default Settings
  isDefault: true,                           // Default address for user
  isDefaultShipping: true,
  isDefaultBilling: false,
  
  // Delivery Preferences
  deliveryInstructions: "Ring doorbell twice. Leave at door if no answer.",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastUsedAt: Timestamp                      // Track when address last used
}
```

### 3.9 Coupons Collection

**Collection Path**: `/coupons/{couponId}`

**Purpose**: Store discount coupons and promotional codes

**Document Structure**:
```javascript
{
  couponId: "coupon_auto_id",
  
  // Coupon Code
  code: "SAVE20",                            // Unique code customers enter
  name: "Summer Sale 20% Off",               // Internal name
  description: "Get 20% off on all summer items",
  
  // Discount Details
  discountType: "percentage",                // percentage/fixed/free_shipping/bogo
  discountValue: 20,                         // 20% or $20
  maxDiscountAmount: 50,                     // Cap for percentage discounts
  minOrderValue: 100,                        // Minimum cart value required
  
  // Validity
  validFrom: Timestamp,
  validUntil: Timestamp,
  timezone: "America/New_York",
  
  // Usage Limits
  usageLimit: 1000,                          // Total times coupon can be used
  usageCount: 324,                           // Times used so far
  perUserLimit: 1,                           // Times each user can use it
  
  // Restrictions
  applicableTo: "all",                       // all/specific_categories/specific_products
  categoryIds: ["cat_clothing"],             // If applicable to categories
  productIds: ["prod_123", "prod_456"],      // If applicable to specific products
  excludedCategoryIds: [],
  excludedProductIds: [],
  
  firstTimeUserOnly: false,                  // Only for new customers?
  minimumPurchaseRequired: false,
  
  // Target Audience
  applicableToUsers: "all",                  // all/specific_users/specific_tiers
  userIds: [],                               // Specific users (for personalized coupons)
  userTiers: ["gold", "platinum"],           // Loyalty tiers
  
  // Stackable
  stackable: false,                          // Can be combined with other coupons?
  
  // Status
  status: "active",                          // active/inactive/expired/depleted
  
  // Vendor (if marketplace)
  vendorId: null,                            // null = platform-wide, otherwise vendor-specific
  
  // Tracking
  viewCount: 1250,                           // How many times viewed/attempted
  
  // Auto-apply
  autoApply: false,                          // Automatically apply if conditions met
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Subcollection** (for tracking usage):
- `/coupons/{couponId}/usage/{userId}` - Track per-user usage

### 3.10 Notifications Collection

**Collection Path**: `/users/{userId}/notifications/{notificationId}`

**Purpose**: Store in-app notifications for users

**Document Structure**:
```javascript
{
  notificationId: "notif_auto_id",
  userId: "user_id_123",
  
  // Notification Content
  type: "order_shipped",                     // order_placed/order_shipped/order_delivered/price_drop/back_in_stock/promotion/account
  title: "Your order has been shipped!",
  message: "Your order #001234 is on its way...",
  
  // Action
  actionType: "open_order",                  // open_order/open_product/open_url/none
  actionData: {
    orderId: "ord_001234",                   // Or productId, url, etc.
    screen: "order_details"
  },
  
  // Media
  imageUrl: "https://storage.../notification-image.jpg",
  icon: "shipping_icon",
  
  // Status
  read: false,
  readAt: null,
  
  // Priority
  priority: "normal",                        // low/normal/high/urgent
  
  // Timestamps
  createdAt: Timestamp,
  expiresAt: Timestamp                       // Auto-delete old notifications
}
```

### 3.11 App Config Collection

**Collection Path**: `/app_config/{configKey}`

**Purpose**: Store app-wide configuration and settings (accessible to all users)

**Example Documents**:

**Document: `maintenance`**
```javascript
{
  configKey: "maintenance",
  maintenanceMode: false,
  maintenanceMessage: "We're currently updating our systems. We'll be back soon!",
  estimatedEndTime: null
}
```

**Document: `featured_banners`**
```javascript
{
  configKey: "featured_banners",
  banners: [
    {
      id: "banner_001",
      imageUrl: "https://storage.../banner-1.jpg",
      mobileImageUrl: "https://storage.../banner-1-mobile.jpg",
      title: "Summer Sale",
      description: "Up to 50% off",
      actionType: "category",                // category/product/url
      actionValue: "cat_summer",
      displayOrder: 1,
      active: true,
      validFrom: Timestamp,
      validUntil: Timestamp
    }
  ]
}
```

**Document: `app_version`**
```javascript
{
  configKey: "app_version",
  android: {
    latestVersion: "1.2.0",
    minSupportedVersion: "1.0.0",
    forceUpdate: false,
    updateMessage: "A new version is available with exciting features!",
    updateUrl: "https://play.google.com/store/apps/details?id=com.yourapp"
  },
  ios: {
    // Similar structure
  }
}
```

**Document: `payment_methods`**
```javascript
{
  configKey: "payment_methods",
  methods: [
    {
      id: "credit_card",
      name: "Credit/Debit Card",
      enabled: true,
      icon: "card_icon",
      displayOrder: 1
    },
    {
      id: "paypal",
      name: "PayPal",
      enabled: true,
      icon: "paypal_icon",
      displayOrder: 2
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      enabled: true,
      icon: "cash_icon",
      surcharge: 2.00,                       // Extra charge for COD
      displayOrder: 3
    }
  ]
}
```

### 3.12 Support Tickets Collection

**Collection Path**: `/support_tickets/{ticketId}`

**Purpose**: Customer support and issue tracking

**Document Structure**:
```javascript
{
  ticketId: "ticket_auto_id",
  ticketNumber: "SUPPORT-001234",
  
  // User Info
  userId: "user_id_123",
  userName: "John Doe",
  userEmail: "john@example.com",
  userPhone: "+1234567890",
  
  // Ticket Details
  subject: "Issue with order delivery",
  category: "order_issue",                   // order_issue/product_inquiry/payment_issue/technical_issue/account/other
  priority: "medium",                        // low/medium/high/urgent
  status: "open",                            // open/in_progress/waiting_for_customer/resolved/closed
  
  // Related Items
  orderId: "ord_001234",                     // If related to an order
  productId: "prod_123",                     // If related to a product
  
  // Description
  description: "My order was supposed to arrive yesterday but hasn't arrived yet...",
  
  // Attachments
  attachments: [
    {
      type: "image",                         // image/document
      url: "https://storage.../attachment.jpg",
      fileName: "screenshot.jpg"
    }
  ],
  
  // Assignment
  assignedTo: "support_agent_456",
  assignedAt: Timestamp,
  
  // Resolution
  resolution: "Order was delayed due to weather. Will be delivered tomorrow.",
  resolvedBy: "support_agent_456",
  resolvedAt: Timestamp,
  
  // Satisfaction
  satisfactionRating: 5,                     // 1-5, after resolution
  satisfactionComment: "Great support!",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  closedAt: null
}
```

**Subcollections**:
- `/support_tickets/{ticketId}/messages/{messageId}` - Conversation thread

### 3.13 Shipping Zones Collection

**Collection Path**: `/shipping_zones/{zoneId}`

**Purpose**: Define shipping rates based on location

**Document Structure**:
```javascript
{
  zoneId: "zone_auto_id",
  name: "United States - Standard",
  
  // Geographic Coverage
  countries: ["US"],
  states: ["NY", "NJ", "CT"],                // If specific states only
  postalCodes: [],                           // If specific postal codes
  
  // Shipping Methods
  methods: [
    {
      methodId: "standard",
      name: "Standard Shipping",
      description: "Delivery in 3-5 business days",
      baseCost: 5.99,
      costCalculationType: "flat_rate",      // flat_rate/weight_based/price_based
      freeShippingThreshold: 50,             // Free shipping if order > $50
      estimatedDays: "3-5",
      enabled: true
    },
    {
      methodId: "express",
      name: "Express Shipping",
      description: "Delivery in 1-2 business days",
      baseCost: 15.99,
      costCalculationType: "flat_rate",
      freeShippingThreshold: 200,
      estimatedDays: "1-2",
      enabled: true
    }
  ],
  
  // Status
  enabled: true,
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 4. Relationships & References

### 4.1 Relationship Types in Firestore

**1. Embedded/Nested Data** (denormalization)
- Store related data directly in the document
- **Best for**: Data that's always accessed together, doesn't change often
- **Example**: User's preferences embedded in user document

**2. Document References** (normalization)
- Store only the document ID, fetch separately
- **Best for**: Large documents, frequently changing data, many-to-many relationships
- **Example**: Store `productId` in order, fetch product details separately

**3. Duplicate/Denormalized Data** (snapshot)
- Copy data at point in time
- **Best for**: Historical records that shouldn't change (order items)
- **Example**: Product name and price stored in order (even if product changes later)

### 4.2 Common Relationships in E-Commerce

**User → Orders**
- One-to-Many
- **Implementation**: Store `userId` in each order document
- **Query**: `orders.where('userId', '==', userId)`

**User → Cart**
- One-to-One
- **Implementation**: Cart document ID = userId OR subcollection `/users/{userId}/cart`

**Product → Reviews**
- One-to-Many
- **Implementation**: Store `productId` in each review document
- **Query**: `product_reviews.where('productId', '==', productId)`

**Order → Order Items**
- One-to-Many
- **Implementation**: Embed items array in order document OR use subcollection
- **Recommendation**: Embed (keeps order atomic, items always accessed together)

**Category → Products**
- One-to-Many
- **Implementation**: Store `categoryId` in each product
- **Query**: `products.where('categoryId', '==', categoryId)`

**Product → Categories** (if multiple categories per product)
- Many-to-Many
- **Implementation**: Store array of `categoryIds` in product
- **Query**: `products.where('categoryIds', 'array-contains', categoryId)`

### 4.3 Denormalization Strategy

**What to Denormalize:**
1. Frequently accessed together (user name in orders)
2. Rarely changes (product name in order items)
3. Small data size
4. Improves read performance

**What NOT to Denormalize:**
5. Frequently changing data (product stock - keep reference)
6. Large data (product full description - fetch separately if needed)
7. Sensitive data that needs tight control

**Example: Order Item Denormalization**
```javascript
// Store these in order items (snapshot at time of order):
- productName ✅
- productPrice ✅
- productImage ✅
- variantName ✅

// Store only reference, fetch if needed:
- Full product description ❌ (large, not critical)
- Current product stock ❌ (changes frequently)
- Current product reviews ❌ (changes frequently)
```

---

## 5. Indexes & Query Optimization

### 5.1 Understanding Firestore Indexes

**Automatic Indexes** (created automatically):
- Single field indexes
- Simple queries on one field

**Composite Indexes** (must be created manually):
- Queries with multiple conditions
- Queries with sorting
- Queries with array-contains + other conditions

### 5.2 Required Composite Indexes

**Products Collection:**
```javascript
// Query: Get products by category, sorted by price
products
  .where('categoryId', '==', 'cat_123')
  .where('status', '==', 'published')
  .orderBy('pricing.salePrice', 'asc')

// Required Index:
// categoryId (Ascending) + status (Ascending) + pricing.salePrice (Ascending)
```

```javascript
// Query: Get featured products, newest first
products
  .where('status', '==', 'published')
  .where('featured', '==', true)
  .orderBy('createdAt', 'desc')

// Required Index:
// status (Ascending) + featured (Ascending) + createdAt (Descending)
```

```javascript
// Query: Products with specific tag, sorted by popularity
products
  .where('tags', 'array-contains', 'summer')
  .where('status', '==', 'published')
  .orderBy('statistics.viewCount', 'desc')

// Required Index:
// tags (Arrays) + status (Ascending) + statistics.viewCount (Descending)
```

**Orders Collection:**
```javascript
// Query: User's orders, newest first
orders
  .where('userId', '==', 'user_123')
  .orderBy('createdAt', 'desc')

// Required Index:
// userId (Ascending) + createdAt (Descending)
```

```javascript
// Query: User's pending orders
orders
  .where('userId', '==', 'user_123')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')

// Required Index:
// userId (Ascending) + status (Ascending) + createdAt (Descending)
```

**Reviews Collection:**
```javascript
// Query: Product reviews, highest rated first
product_reviews
  .where('productId', '==', 'prod_123')
  .where('status', '==', 'approved')
  .orderBy('rating', 'desc')
  .orderBy('createdAt', 'desc')

// Required Index:
// productId (Ascending) + status (Ascending) + rating (Descending) + createdAt (Descending)
```

### 5.3 Query Optimization Techniques

**1. Use Limit() to Reduce Reads**
```javascript
// Instead of fetching all products
products.where('categoryId', '==', 'cat_123').get()

// Fetch limited set with pagination
products.where('categoryId', '==', 'cat_123').limit(20).get()
```

**2. Use Pagination with startAfter()**
```javascript
// First page
const first = await products.limit(20).get()

// Next page
const lastVisible = first.docs[first.docs.length - 1]
const next = await products
  .limit(20)
  .startAfter(lastVisible)
  .get()
```

**3. Use Local Cache**
```javascript
// Enable persistence for offline support
FirebaseFirestore.getInstance()
  .firestoreSettings = firestoreSettings {
    isPersistenceEnabled = true
  }
```

**4. Use Snapshots for Real-Time Updates Only When Needed**
```javascript
// One-time read (cheaper)
val products = productsRef.get().await()

// Real-time listener (use only when real-time needed)
productsRef.addSnapshotListener { snapshot, error ->
  // Updates in real-time
}
```

**5. Avoid Array-Contains on Large Arrays**
- Arrays should be small (< 100 items)
- For large lists, use a separate collection

### 5.4 Index Management Strategy

**Create Indexes:**
1. In Firebase Console: Firestore → Indexes
2. Via Firebase CLI: Export/import index configuration
3. Error-driven: Firestore tells you which indexes needed when query fails

**index.json Example:**
```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categoryId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "pricing.salePrice", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 6. Security Rules

### 6.1 Security Rules Overview

**Purpose**: Control who can read/write which documents

**Rule Structure**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rules go here
  }
}
```

### 6.2 Example Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isVendor() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'vendor';
    }
    
    // Users Collection
    match /users/{userId} {
      // Anyone can create their own user document during signup
      allow create: if isSignedIn() && request.auth.uid == userId;
      
      // Users can read and update their own document
      allow read, update: if isOwner(userId);
      
      // Admins can read all users
      allow read: if isAdmin();
      
      // Addresses subcollection
      match /addresses/{addressId} {
        allow read, write: if isOwner(userId);
      }
      
      // Notifications subcollection
      match /notifications/{notificationId} {
        allow read: if isOwner(userId);
        allow write: if false; // Only backend can write notifications
      }
    }
    
    // Products Collection
    match /products/{productId} {
      // Anyone can read published products
      allow read: if resource.data.status == 'published';
      
      // Admins and vendors can read all products
      allow read: if isAdmin() || isVendor();
      
      // Only admins and product's vendor can write
      allow create, update: if isAdmin() || 
                               (isVendor() && request.auth.uid == resource.data.vendorId);
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Categories Collection
    match /categories/{categoryId} {
      // Anyone can read active categories
      allow read: if resource.data.status == 'active';
      
      // Only admins can write
      allow write: if isAdmin();
    }
    
    // Orders Collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if isOwner(resource.data.userId);
      
      // Users can create orders for themselves
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.userId;
      
      // Users cannot update orders (only backend can via Cloud Functions)
      allow update: if false;
      
      // Admins can read and update all orders
      allow read, update: if isAdmin();
      
      // Vendors can read orders containing their products
      allow read: if isVendor(); // (add logic to check if order contains vendor's products)
    }
    
    // Carts Collection
    match /carts/{userId} {
      // Users can only access their own cart
      allow read, write: if isOwner(userId);
    }
    
    // Wishlists Collection
    match /wishlists/{userId} {
      // Users can only access their own wishlist
      allow read, write: if isOwner(userId);
      
      // Public wishlists can be read by anyone
      allow read: if resource.data.isPublic == true;
    }
    
    // Product Reviews Collection
    match /product_reviews/{reviewId} {
      // Anyone can read approved reviews
      allow read: if resource.data.status == 'approved';
      
      // Users can create reviews for products they purchased
      allow create: if isSignedIn() && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can update their own pending reviews
      allow update: if isOwner(resource.data.userId) && 
                       resource.data.status == 'pending';
      
      // Admins can read and update all reviews
      allow read, update: if isAdmin();
    }
    
    // Coupons Collection
    match /coupons/{couponId} {
      // Users can read active coupons
      allow read: if isSignedIn() && resource.data.status == 'active';
      
      // Only admins can write
      allow write: if isAdmin();
    }
    
    // App Config Collection (read-only for users)
    match /app_config/{configKey} {
      allow read: if true; // Public read access
      allow write: if isAdmin();
    }
    
    // Support Tickets Collection
    match /support_tickets/{ticketId} {
      // Users can read their own tickets
      allow read: if isOwner(resource.data.userId);
      
      // Users can create tickets
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.userId;
      
      // Admins and support agents can read and update all tickets
      allow read, update: if isAdmin();
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isOwner(get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId);
        allow create: if isSignedIn();
      }
    }
    
    // Shipping Zones Collection (read-only for users)
    match /shipping_zones/{zoneId} {
      allow read: if resource.data.enabled == true;
      allow write: if isAdmin();
    }
    
    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 6.3 Security Rules Best Practices

1. **Default Deny**: Start with denying everything, then explicitly allow
2. **Validate Data**: Check data types and required fields in rules
3. **Limit Document Size**: Prevent users from creating huge documents
4. **Rate Limiting**: Implement via Cloud Functions (Firestore rules can't do this)
5. **Test Rules**: Use Firestore emulator and Rules Playground

**Example: Data Validation in Rules**
```javascript
match /product_reviews/{reviewId} {
  allow create: if isSignedIn() &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.rating is int &&
                   request.resource.data.rating >= 1 &&
                   request.resource.data.rating <= 5 &&
                   request.resource.data.reviewText.size() <= 2000;
}
```

---

## 7. Data Validation

### 7.1 Client-Side Validation (Android App)

**Before writing to Firestore, validate:**
1. Required fields present
2. Data types correct
3. String lengths within limits
4. Numbers within acceptable ranges
5. Valid enum values
6. URLs properly formatted
7. Emails validated

**Example Validation (Kotlin):**
```kotlin
data class ProductReview(
    val productId: String,
    val userId: String,
    val rating: Int,
    val reviewText: String
) {
    fun validate(): Boolean {
        return productId.isNotBlank() &&
               userId.isNotBlank() &&
               rating in 1..5 &&
               reviewText.length in 10..2000
    }
}
```

### 7.2 Server-Side Validation (Cloud Functions)

**Critical operations should be validated on server:**
- Order creation (verify prices haven't been tampered with)
- Payment processing
- Stock updates
- Sensitive data modifications

**Example Cloud Function Validation:**
```javascript
exports.createOrder = functions.https.onCall(async (data, context) => {
  // Validate user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }
  
  // Validate order data
  if (!data.items || data.items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Order must have items');
  }
  
  // Verify prices from database (don't trust client)
  for (const item of data.items) {
    const product = await db.collection('products').doc(item.productId).get();
    const actualPrice = product.data().pricing.salePrice;
    
    if (item.unitPrice !== actualPrice) {
      throw new functions.https.HttpsError('invalid-argument', 'Price mismatch detected');
    }
  }
  
  // Create order...
});
```

---

## 8. Scalability Considerations

### 8.1 Document Size Limits

**Firestore Limits:**
- Maximum document size: 1 MB
- Maximum subcollections: Unlimited
- Maximum writes per second to a document: 1

**Solutions:**
1. **Split Large Documents**: Use subcollections for large nested data
2. **Paginate Arrays**: Don't store large arrays in documents
3. **Use Distributed Counters**: For high-frequency writes (view counts)

### 8.2 Hot Spots (Write Contention)

**Problem**: Writing to the same document too frequently causes errors

**Example Hot Spots:**
- Product view counter (many users viewing same product)
- Global statistics document
- Category product counts

**Solution: Distributed Counters**
```javascript
// Instead of single counter:
products/{productId}
  viewCount: 1250  ❌ (hot spot!)

// Use distributed counter:
products/{productId}/view_stats/{shard_0}
  count: 250
products/{productId}/view_stats/{shard_1}
  count: 230
products/{productId}/view_stats/{shard_2}
  count: 270
...

// Total views = sum of all shards
// Update random shard on each view
```

### 8.3 Read/Write Cost Optimization

**Minimize Costs:**
1. **Cache Aggressively**: Use local cache, reduce repeated reads
2. **Batch Writes**: Group multiple writes together
3. **Avoid Listening to Large Collections**: Use targeted listeners
4. **Paginate Results**: Use limit() and pagination
5. **Denormalize Read-Heavy Data**: Trade storage for fewer reads

**Example Cost Comparison:**
```
// Expensive: Fetch product + category + vendor (3 reads)
const product = await productsRef.doc(id).get();        // 1 read
const category = await categoriesRef.doc(catId).get();  // 1 read
const vendor = await vendorsRef.doc(vendorId).get();    // 1 read
Total: 3 reads × $0.06/100K = expensive at scale

// Cheaper: Denormalize category name and vendor name in product
const product = await productsRef.doc(id).get();        // 1 read
// product already has categoryName and vendorName
Total: 1 read × $0.06/100K = 3x cheaper ✅
```

### 8.4 Sharding Strategy

**For High-Traffic Collections:**
- Shard users by userId prefix: `/users_a/{userId}`, `/users_b/{userId}`
- Shard orders by date: `/orders_2024_01/{orderId}`, `/orders_2024_02/{orderId}`
- Beneficial when collection > 1 million documents

---

## 9. Backup & Recovery

### 9.1 Firestore Backup Options

**1. Automated Firestore Backups** (Firestore feature)
- Schedule daily/weekly backups
- Retention period configurable
- Restore to new project or existing

**Setup:**
```bash
# Enable automatic backups in Firebase Console
# Firestore → Backups → Schedule backups
```

**2. Export/Import**
```bash
# Export entire database
gcloud firestore export gs://[BUCKET_NAME]

# Import database
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_PATH]
```

**3. Cloud Functions Backup** (custom solution)
```javascript
// Scheduled function to backup critical collections
exports.dailyBackup = functions.pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .onRun(async (context) => {
    const backup = await admin.firestore().backup();
    // Store backup location in tracking document
  });
```

### 9.2 Data Recovery Strategy

**Soft Delete Pattern:**
- Don't actually delete documents
- Add `deletedAt` timestamp
- Filter out deleted documents in queries
- Allows easy recovery

```javascript
// Instead of:
await productRef.delete();  ❌

// Do this:
await productRef.update({
  deletedAt: FieldValue.serverTimestamp(),
  status: 'deleted'
});  ✅

// Query excludes soft-deleted:
products.where('deletedAt', '==', null)
```

**Audit Trail:**
- Log all important changes
- Store who changed what and when
- Helpful for debugging and recovery

### 9.3 Disaster Recovery Plan

**1. Regular Backups**: Schedule daily Firestore exports
**2. Multi-Region**: Use Firestore multi-region locations
**3. Backup Firebase Auth**: Export user accounts regularly
**4. Backup Storage**: Enable versioning on Firebase Storage
**5. Documentation**: Keep runbooks for recovery procedures
**6. Test Recovery**: Regularly test restoration process

---

## 10. Migration Strategy

### 10.1 Data Migration Planning

**When Migrations Needed:**
- Schema changes (add/remove fields)
- Data restructuring (moving from subcollection to root collection)
- Data type changes (string to number)
- Denormalization updates

### 10.2 Migration Approaches

**1. Lazy Migration** (Gradual)
- Migrate data as it's accessed
- Write new format, read both formats
- Safest for production

**Example:**
```kotlin
// Read function handles both old and new format
fun readProduct(doc: DocumentSnapshot): Product {
    return if (doc.contains("pricing.price")) {
        // Old format
        Product(price = doc.getDouble("pricing.price"))
    } else {
        // New format
        Product(price = doc.getDouble("pricing.salePrice"))
    }
}

// Write function always uses new format
fun writeProduct(product: Product) {
    db.collection("products").document(id).set(
        mapOf("pricing.salePrice" to product.price)
    )
}
```

**2. Batch Migration** (All at once)
- Use Cloud Function or script
- Run during low-traffic period
- Good for small datasets

**Example Cloud Function:**
```javascript
exports.migrateProducts = functions.https.onRequest(async (req, res) => {
  const batch = db.batch();
  const products = await db.collection('products').get();
  
  let count = 0;
  products.docs.forEach(doc => {
    const newData = {
      'pricing.salePrice': doc.data().pricing.price,
      'migrated': true
    };
    batch.update(doc.ref, newData);
    
    count++;
    // Firestore batch limit: 500 operations
    if (count === 500) {
      await batch.commit();
      count = 0;
    }
  });
  
  if (count > 0) {
    await batch.commit();
  }
  
  res.send('Migration complete');
});
```

**3. Dual-Write** (Transition period)
- Write to both old and new structure
- Gradually migrate readers to new structure
- Delete old structure after all migrated

### 10.3 Migration Best Practices

1. **Test on Copy**: Test migration on a copy of production data first
2. **Backup First**: Always backup before migration
3. **Rollback Plan**: Have a plan to undo if something goes wrong
4. **Monitor**: Watch for errors during and after migration
5. **Gradual Rollout**: Migrate in phases (10% → 50% → 100%)
6. **Version Field**: Add version field to documents for tracking

```javascript
{
  schemaVersion: 2,  // Track which schema version
  // ... rest of document
}
```

---

## 11. Performance Monitoring & Analytics

### 11.1 Firestore Performance Tracking

**Monitor These Metrics:**
1. **Read/Write Counts**: Track daily usage and costs
2. **Query Performance**: Slow queries (> 1 second)
3. **Document Size**: Large documents (> 100 KB)
4. **Index Usage**: Unused indexes (waste storage)
5. **Error Rates**: Permission denied, not found, etc.

**Firebase Console Dashboards:**
- Firestore Usage tab: Read/write counts
- Monitoring tab: Performance metrics
- Rules tab: Requests allowed/denied

### 11.2 Custom Performance Tracking

**Log Expensive Operations:**
```kotlin
// Track time for Firestore operations
val startTime = System.currentTimeMillis()
val products = db.collection("products").get().await()
val duration = System.currentTimeMillis() - startTime

// Log to Firebase Analytics
firebaseAnalytics.logEvent("firestore_query") {
    param("collection", "products")
    param("duration_ms", duration)
    param("result_count", products.size())
}

// Alert if slow
if (duration > 2000) {
    Timber.w("Slow Firestore query: ${duration}ms")
}
```

---

## 12. Testing Strategy

### 12.1 Firestore Emulator

**Benefits:**
- Test locally without internet
- No cost for reads/writes
- Test security rules safely
- Faster development

**Setup:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulator
firebase emulators:start
```

**Connect Android App:**
```kotlin
// In debug builds only
if (BuildConfig.DEBUG) {
    FirebaseFirestore.getInstance().useEmulator("10.0.2.2", 8080)
    FirebaseAuth.getInstance().useEmulator("10.0.2.2", 9099)
}
```

### 12.2 Test Data Population

**Seed Test Data:**
```kotlin
// Populate emulator with test data
suspend fun seedTestData() {
    // Create test categories
    db.collection("categories").add(testCategory)
    
    // Create test products
    repeat(50) {
        db.collection("products").add(generateTestProduct())
    }
    
    // Create test user
    db.collection("users").document(testUserId).set(testUser)
}
```

### 12.3 Security Rules Testing

**Test in Firebase Console:**
- Firestore → Rules → Rules Playground
- Simulate reads/writes with different auth states

**Automated Testing:**
```javascript
// Use @firebase/rules-unit-testing
const firebase = require('@firebase/rules-unit-testing');

describe('Firestore Security Rules', () => {
  it('should allow user to read their own data', async () => {
    const db = firebase.initializeTestApp({
      projectId: "test-project",
      auth: { uid: "user123" }
    }).firestore();
    
    const doc = db.collection('users').doc('user123');
    await firebase.assertSucceeds(doc.get());
  });
  
  it('should deny user from reading others data', async () => {
    const db = firebase.initializeTestApp({
      projectId: "test-project",
      auth: { uid: "user123" }
    }).firestore();
    
    const doc = db.collection('users').doc('user456');
    await firebase.assertFails(doc.get());
  });
});
```

---

## 13. Cost Estimation & Optimization

### 13.1 Firestore Pricing (as of 2024)

**Document Operations:**
- Read: $0.06 per 100,000 documents
- Write: $0.18 per 100,000 documents
- Delete: $0.02 per 100,000 documents

**Storage:**
- $0.18 per GB/month

**Network:**
- First 10 GB/month free
- $0.12 per GB after

**Free Tier (Spark Plan):**
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

### 13.2 Monthly Cost Estimation

**Example: 10,000 Active Users**

Assumptions:
- Each user views 50 products/day (500,000 reads/day)
- Each user adds 2 items to cart (20,000 writes/day)
- 100 orders/day (100 writes/day)
- 200 reviews/day (200 writes/day)

**Monthly Calculations:**
```
Reads: 500,000 reads/day × 30 days = 15,000,000 reads/month
Cost: 15,000,000 ÷ 100,000 × $0.06 = $9.00

Writes: 20,100 writes/day × 30 days = 603,000 writes/month
Cost: 603,000 ÷ 100,000 × $0.18 = $1.09

Storage: 2 GB × $0.18 = $0.36

Total: ~$10.45/month
```

### 13.3 Cost Optimization Tips

1. **Enable Offline Persistence**: Reduces redundant reads
2. **Cache Static Data**: Categories, config rarely change
3. **Limit Queries**: Use `.limit()` always
4. **Batch Operations**: Group reads/writes
5. **Optimize Listeners**: Detach when not needed
6. **Use Cloud Functions**: Pre-aggregate expensive queries
7. **Monitor Usage**: Set billing alerts
8. **Lazy Load**: Don't fetch everything at once

---

## 14. Implementation Checklist

### 14.1 Initial Setup

- [ ] Create Firebase project
- [ ] Enable Firestore
- [ ] Choose Firestore location (cannot be changed later!)
- [ ] Set up Firebase Authentication
- [ ] Configure Firebase Storage
- [ ] Add Android app to Firebase project
- [ ] Download `google-services.json`
- [ ] Add Firebase dependencies to Android project

### 14.2 Data Modeling

- [ ] Design collections structure
- [ ] Define document schemas
- [ ] Plan relationships
- [ ] Identify denormalization needs
- [ ] Document naming conventions
- [ ] Plan for future scalability

### 14.3 Security

- [ ] Write Security Rules for all collections
- [ ] Test Security Rules
- [ ] Implement data validation (client & server)
- [ ] Set up user roles and permissions
- [ ] Review sensitive data handling
- [ ] Enable Firebase App Check (bot protection)

### 14.4 Performance

- [ ] Identify required composite indexes
- [ ] Create indexes in Firebase Console
- [ ] Implement pagination
- [ ] Enable offline persistence
- [ ] Set up caching strategy
- [ ] Optimize query patterns

### 14.5 Testing

- [ ] Set up Firestore Emulator
- [ ] Create test data seeds
- [ ] Test Security Rules
- [ ] Test offline functionality
- [ ] Load testing for scale
- [ ] Test migration scripts

### 14.6 Monitoring

- [ ] Set up Firebase Analytics
- [ ] Configure crash reporting
- [ ] Set billing alerts
- [ ] Monitor read/write usage
- [ ] Track query performance
- [ ] Set up error logging

### 14.7 Backup & Recovery

- [ ] Enable automated Firestore backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up audit logging
- [ ] Implement soft delete pattern

---

## 15. Common Pitfalls & How to Avoid

### 15.1 Pitfall: Not Planning for Offline

**Problem**: App breaks when no internet connection

**Solution**:
- Enable offline persistence
- Handle offline state gracefully in UI
- Show cached data
- Queue writes for when online

### 15.2 Pitfall: Over-Normalizing

**Problem**: Too many reads to display simple data (expensive & slow)

**Solution**:
- Denormalize frequently accessed data
- Store snapshots in orders (product name, price)
- Duplicate category name in products

### 15.3 Pitfall: Ignoring Document Size Limits

**Problem**: Document exceeds 1 MB limit, writes fail

**Solution**:
- Use subcollections for large nested data
- Paginate arrays
- Store large content (images) in Storage, not Firestore

### 15.4 Pitfall: Not Using Indexes

**Problem**: Complex queries fail or are slow

**Solution**:
- Create composite indexes for multi-field queries
- Monitor query performance
- Use Firebase Console error messages to create indexes

### 15.5 Pitfall: Weak Security Rules

**Problem**: Data breach, unauthorized access

**Solution**:
- Start with deny-all, explicitly allow
- Test rules thoroughly
- Validate data in rules
- Never trust client-side validation alone

### 15.6 Pitfall: Not Monitoring Costs

**Problem**: Unexpected high bills

**Solution**:
- Set billing alerts
- Monitor usage in Firebase Console
- Optimize queries
- Cache aggressively
- Limit pagination

---

## 16. Useful Resources

### 16.1 Official Documentation

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Pricing](https://firebase.google.com/pricing)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

### 16.2 Tools

- Firebase Console: https://console.firebase.google.com
- Firebase CLI: `npm install -g firebase-tools`
- Firestore Emulator: For local testing
- Rules Playground: Test security rules

### 16.3 Community

- Firebase Slack Community
- Stack Overflow: Tag [google-cloud-firestore]
- Firebase YouTube Channel

---

## 17. Next Steps

### Phase 1: Setup (Week 1)
1. Create Firebase project
2. Set up collections structure
3. Write security rules
4. Create initial indexes

### Phase 2: Core Implementation (Weeks 2-4)
1. Implement Users and Auth
2. Implement Products catalog
3. Implement Cart functionality
4. Implement Orders

### Phase 3: Enhanced Features (Weeks 5-6)
1. Implement Reviews
2. Implement Wishlists
3. Implement Coupons
4. Implement Notifications

### Phase 4: Testing & Optimization (Week 7)
1. Load testing
2. Security audit
3. Performance optimization
4. Cost analysis

### Phase 5: Launch Preparation (Week 8)
1. Production security rules
2. Backup configuration
3. Monitoring setup
4. Documentation finalization

---

## Document Metadata

**Version**: 1.0  
**Last Updated**: December 17, 2025  
**Author**: Development Team  
**Status**: Draft - Pending Review

**Review Cycle**: Update this document as:
- Schema changes are made
- New collections added
- Performance issues discovered
- Security rules updated
- Lessons learned during development

---

## Appendix: Quick Reference

### Common Firestore Operations (Kotlin)

**Initialize Firestore:**
```kotlin
val db = Firebase.firestore
```

**Create Document:**
```kotlin
val product = hashMapOf(
    "name" to "Blue T-Shirt",
    "price" to 29.99
)
db.collection("products").add(product)
```

**Read Document:**
```kotlin
val doc = db.collection("products").document(productId).get().await()
val product = doc.toObject<Product>()
```

**Update Document:**
```kotlin
db.collection("products").document(productId)
    .update("price", 24.99)
```

**Delete Document:**
```kotlin
db.collection("products").document(productId).delete()
```

**Query Collection:**
```kotlin
val products = db.collection("products")
    .whereEqualTo("categoryId", "cat_123")
    .orderBy("price")
    .limit(20)
    .get()
    .await()
```

**Listen to Real-Time Updates:**
```kotlin
db.collection("orders")
    .whereEqualTo("userId", currentUserId)
    .addSnapshotListener { snapshot, error ->
        if (error != null) {
            // Handle error
            return@addSnapshotListener
        }
        
        val orders = snapshot?.toObjects(Order::class.java)
        // Update UI
    }
```

**Batch Write:**
```kotlin
val batch = db.batch()
batch.set(docRef1, data1)
batch.update(docRef2, "field", value)
batch.delete(docRef3)
batch.commit()
```

**Transaction:**
```kotlin
db.runTransaction { transaction ->
    val product = transaction.get(productRef).toObject<Product>()
    val newStock = product.stock - quantity
    transaction.update(productRef, "stock", newStock)
    newStock
}.await()
```

---

**End of Document**


