# Android E-Commerce App - Modules & Architecture Plan

## Document Overview
This document outlines the complete module structure, components, features, and Firebase integration strategy for the Android e-commerce application built with Kotlin, Clean Architecture, and MVVM pattern.

---

## Table of Contents
1. [Application Architecture Overview](#1-application-architecture-overview)
2. [Module Structure](#2-module-structure)
3. [Core Modules](#3-core-modules)
4. [Feature Modules](#4-feature-modules)
5. [Shared Modules](#5-shared-modules)
6. [Navigation Architecture](#6-navigation-architecture)
7. [Dependency Graph](#7-dependency-graph)
8. [Firebase Integration Strategy](#8-firebase-integration-strategy)
9. [State Management](#9-state-management)
10. [Error Handling](#10-error-handling)
11. [Testing Strategy by Module](#11-testing-strategy-by-module)
12. [Build Configuration](#12-build-configuration)

---

## 1. Application Architecture Overview

### 1.1 Architecture Pattern: Clean Architecture + MVVM

**Three Main Layers:**

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  (UI Components, Activities, Fragments, ViewModels)     │
└─────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                         │
│        (Use Cases, Business Logic, Entities)            │
└─────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  (Repositories, Data Sources, Firebase, Local Cache)    │
└─────────────────────────────────────────────────────────┘
```

**Key Principles:**
- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Rule**: Inner layers don't know about outer layers
- **Testability**: Each layer can be tested independently
- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Clear structure makes code easier to understand and modify

### 1.2 MVVM Components

**View (UI)**
- Activities and Fragments
- XML layouts or Jetpack Compose
- Observes ViewModel
- Handles user interactions
- No business logic

**ViewModel**
- Holds UI state
- Survives configuration changes
- Calls Use Cases
- Transforms domain data for UI
- Manages UI events

**Model (Domain + Data)**
- Domain entities (business objects)
- Use Cases (business logic)
- Repositories (data access)
- Data sources (Firebase, local cache)

### 1.3 Multi-Module Architecture Benefits

**Why Multi-Module?**
1. **Faster Build Times**: Only modified modules rebuild
2. **Clear Boundaries**: Each module has defined responsibilities
3. **Reusability**: Shared modules used across features
4. **Team Collaboration**: Different teams work on different modules
5. **Dynamic Features**: Can implement on-demand module loading
6. **Enforced Dependencies**: Compiler prevents wrong dependencies

---

## 2. Module Structure

### 2.1 Module Categories

```
app/                                    # Main app module (container)
├── feature/                            # Feature modules
│   ├── auth/                           # Authentication & onboarding
│   ├── home/                           # Home/dashboard
│   ├── products/                       # Product catalog & details
│   ├── search/                         # Search & filters
│   ├── cart/                           # Shopping cart
│   ├── checkout/                       # Checkout process
│   ├── orders/                         # Order management
│   ├── profile/                        # User profile
│   ├── wishlist/                       # Wishlist/favorites
│   ├── reviews/                        # Product reviews
│   ├── notifications/                  # Notifications center
│   └── support/                        # Customer support
├── core/                               # Core modules
│   ├── network/                        # Firebase configuration
│   ├── database/                       # Local database (Room)
│   ├── datastore/                      # Preferences storage
│   └── common/                         # Common utilities
├── shared/                             # Shared modules
│   ├── ui/                             # Shared UI components
│   ├── domain/                         # Shared domain models
│   ├── data/                           # Shared data models
│   └── resources/                      # Shared resources (strings, drawables)
└── buildSrc/                           # Build configuration
```

### 2.2 Module Naming Convention

**Feature Modules**: `feature-<feature-name>`
- Example: `feature-auth`, `feature-products`

**Core Modules**: `core-<functionality>`
- Example: `core-network`, `core-database`

**Shared Modules**: `shared-<type>`
- Example: `shared-ui`, `shared-domain`

### 2.3 Module Dependencies Rules

**Allowed Dependencies:**
- Feature modules → Core modules ✅
- Feature modules → Shared modules ✅
- Core modules → Other core modules ✅
- Shared modules → Core modules ✅

**Forbidden Dependencies:**
- Feature modules → Feature modules ❌
- Core modules → Feature modules ❌
- Shared modules → Feature modules ❌

---

## 3. Core Modules

### 3.1 Core Network Module

**Purpose**: Firebase configuration and network connectivity

**Package Structure:**
```
core/network/
├── src/main/kotlin/
│   ├── firebase/
│   │   ├── FirebaseModule.kt              # Dagger/Hilt module
│   │   ├── FirebaseAuthProvider.kt        # Auth wrapper
│   │   ├── FirestoreProvider.kt           # Firestore wrapper
│   │   ├── FirebaseStorageProvider.kt     # Storage wrapper
│   │   └── FirebaseFunctionsProvider.kt   # Cloud Functions wrapper
│   ├── connectivity/
│   │   ├── NetworkMonitor.kt              # Network status monitoring
│   │   └── ConnectivityObserver.kt        # Connectivity state flow
│   ├── interceptors/
│   │   ├── AuthInterceptor.kt             # Add auth token to requests
│   │   └── ErrorInterceptor.kt            # Handle network errors
│   └── utils/
│       ├── FirebaseExceptionMapper.kt     # Map Firebase errors
│       └── NetworkUtils.kt                # Network helper functions
```

**Key Components:**

1. **FirebaseModule**
   - Provides Firebase instances (Auth, Firestore, Storage, Functions, Messaging)
   - Configures Firebase with google-services.json
   - Sets up Firebase Analytics and Crashlytics
   - Configures Firebase Emulator for debug builds

2. **FirebaseAuthProvider**
   - Wraps Firebase Authentication
   - Provides current user info
   - Handles token management
   - Emits auth state changes

3. **FirestoreProvider**
   - Wraps Firestore operations
   - Enables offline persistence
   - Provides base CRUD operations
   - Handles query builders

4. **NetworkMonitor**
   - Monitors internet connectivity
   - Provides connectivity StateFlow
   - Differentiates between WiFi and Cellular
   - Notifies when connection restored

**Firebase Integration:**
- Initialize Firebase on app startup
- Configure Firestore settings (persistence, cache size)
- Set up Firebase Performance Monitoring
- Configure Firebase Remote Config

**Features:**
- Automatic token refresh
- Network connectivity detection
- Firebase error handling and mapping
- Debug/Release configuration switching
- Emulator support for development

---

### 3.2 Core Database Module

**Purpose**: Local data storage and caching using Room

**Package Structure:**
```
core/database/
├── src/main/kotlin/
│   ├── AppDatabase.kt                     # Room database
│   ├── dao/
│   │   ├── ProductDao.kt                  # Product cache DAO
│   │   ├── CategoryDao.kt                 # Category cache DAO
│   │   ├── CartDao.kt                     # Cart items DAO
│   │   ├── OrderDao.kt                    # Orders cache DAO
│   │   └── UserDao.kt                     # User data DAO
│   ├── entities/
│   │   ├── ProductEntity.kt               # Product table entity
│   │   ├── CategoryEntity.kt              # Category table entity
│   │   ├── CartItemEntity.kt              # Cart table entity
│   │   ├── OrderEntity.kt                 # Order table entity
│   │   └── UserEntity.kt                  # User table entity
│   ├── converters/
│   │   ├── DateConverter.kt               # Date type converter
│   │   ├── ListConverter.kt               # List type converter
│   │   └── JsonConverter.kt               # JSON object converter
│   └── migrations/
│       └── Migrations.kt                  # Database migrations
```

**Key Components:**

1. **AppDatabase**
   - Room database instance
   - Defines all tables (entities)
   - Manages database version
   - Provides DAOs

2. **DAOs (Data Access Objects)**
   - Define database operations (queries, inserts, updates, deletes)
   - Return Flow/LiveData for reactive updates
   - Support transactions

3. **Entities**
   - Local database representations
   - Mirror Firestore documents structure
   - Include timestamp for cache expiration

4. **Converters**
   - Convert complex types to database-compatible types
   - Serialize/deserialize JSON objects
   - Handle custom data types

**Features:**
- Offline data access
- Cache Firestore data locally
- Sync with Firebase when online
- Cache expiration policies
- Full-text search on cached data

---

### 3.3 Core DataStore Module

**Purpose**: Key-value storage for app preferences and settings

**Package Structure:**
```
core/datastore/
├── src/main/kotlin/
│   ├── PreferencesDataStore.kt            # DataStore wrapper
│   ├── UserPreferences.kt                 # User preferences
│   ├── AppSettings.kt                     # App settings
│   ├── OnboardingPreferences.kt           # Onboarding state
│   └── serializers/
│       └── PreferencesSerializer.kt       # Proto DataStore serializer
```

**Key Components:**

1. **PreferencesDataStore**
   - Wraps Android DataStore
   - Provides type-safe preference access
   - Emits preference changes as Flow

2. **User Preferences**
   - Theme preference (light/dark/auto)
   - Language preference
   - Notification settings
   - Location permissions

3. **App Settings**
   - Cache size limits
   - Image quality preferences
   - Auto-play video settings
   - Data saver mode

4. **Onboarding Preferences**
   - First launch flag
   - Onboarding completed
   - Feature introductions shown

**Features:**
- Fast read/write operations
- Type-safe storage
- Asynchronous operations
- Coroutines support
- Reactive preference changes

---

### 3.4 Core Common Module

**Purpose**: Common utilities, extensions, and base classes

**Package Structure:**
```
core/common/
├── src/main/kotlin/
│   ├── base/
│   │   ├── BaseActivity.kt                # Base activity
│   │   ├── BaseFragment.kt                # Base fragment
│   │   ├── BaseViewModel.kt               # Base ViewModel
│   │   └── BaseRepository.kt              # Base repository
│   ├── extensions/
│   │   ├── ContextExtensions.kt           # Context extensions
│   │   ├── ViewExtensions.kt              # View extensions
│   │   ├── StringExtensions.kt            # String extensions
│   │   ├── FlowExtensions.kt              # Flow extensions
│   │   └── DateExtensions.kt              # Date/time extensions
│   ├── utils/
│   │   ├── DateTimeUtils.kt               # Date formatting
│   │   ├── CurrencyUtils.kt               # Currency formatting
│   │   ├── ValidationUtils.kt             # Input validation
│   │   ├── ImageUtils.kt                  # Image processing
│   │   └── Logger.kt                      # Logging wrapper
│   ├── constants/
│   │   ├── AppConstants.kt                # App-wide constants
│   │   ├── FirebaseConstants.kt           # Firebase collection names
│   │   └── NavigationConstants.kt         # Deep link constants
│   └── result/
│       └── Result.kt                      # Result wrapper class
```

**Key Components:**

1. **Base Classes**
   - Common functionality for Activities, Fragments, ViewModels
   - Handle loading states, errors
   - Set up observers
   - Initialize UI

2. **Extensions**
   - Kotlin extension functions
   - Simplify common operations
   - Improve code readability

3. **Utils**
   - Reusable utility functions
   - Format currency, dates
   - Validate inputs
   - Process images

4. **Result Wrapper**
   - Wrap operation results (Success, Error, Loading)
   - Consistent error handling
   - Type-safe results

**Features:**
- Reduce code duplication
- Consistent error handling
- Standardized logging
- Common UI behaviors
- Utility functions

---

## 4. Feature Modules

### 4.1 Feature: Authentication Module

**Purpose**: User authentication, registration, and onboarding

**Package Structure:**
```
feature/auth/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── login/
│   │   │   ├── LoginFragment.kt
│   │   │   ├── LoginViewModel.kt
│   │   │   └── LoginState.kt
│   │   ├── signup/
│   │   │   ├── SignUpFragment.kt
│   │   │   ├── SignUpViewModel.kt
│   │   │   └── SignUpState.kt
│   │   ├── forgot_password/
│   │   │   ├── ForgotPasswordFragment.kt
│   │   │   └── ForgotPasswordViewModel.kt
│   │   ├── otp/
│   │   │   ├── OtpVerificationFragment.kt
│   │   │   └── OtpVerificationViewModel.kt
│   │   ├── onboarding/
│   │   │   ├── OnboardingFragment.kt
│   │   │   └── OnboardingViewModel.kt
│   │   └── social_login/
│   │       ├── SocialLoginHandler.kt
│   │       └── SocialLoginCallback.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── User.kt
│   │   │   └── AuthResult.kt
│   │   ├── usecase/
│   │   │   ├── LoginUseCase.kt
│   │   │   ├── SignUpUseCase.kt
│   │   │   ├── LogoutUseCase.kt
│   │   │   ├── SendPasswordResetUseCase.kt
│   │   │   ├── VerifyOtpUseCase.kt
│   │   │   ├── GoogleSignInUseCase.kt
│   │   │   ├── GetCurrentUserUseCase.kt
│   │   │   └── UpdateProfileUseCase.kt
│   │   └── repository/
│   │       └── AuthRepository.kt
│   └── data/
│       ├── repository/
│       │   └── AuthRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── AuthRemoteDataSource.kt
│       │   └── local/
│       │       └── AuthLocalDataSource.kt
│       └── mapper/
│           └── UserMapper.kt
```

**Features:**

1. **Email/Password Authentication**
   - Login with email and password
   - Sign up with email and password
   - Email verification
   - Password strength validation
   - Remember me functionality

2. **Social Login**
   - Google Sign-In
   - Facebook Login (optional)
   - Apple Sign-In (optional)
   - One-tap sign-in

3. **Phone Authentication**
   - Phone number input
   - OTP verification
   - Automatic SMS reading
   - Resend OTP functionality

4. **Password Management**
   - Forgot password
   - Reset password via email
   - Change password
   - Password visibility toggle

5. **Onboarding**
   - Welcome screens
   - Feature highlights
   - Permission requests
   - Skip option

6. **Session Management**
   - Auto-login for returning users
   - Session timeout
   - Logout functionality
   - Multi-device session handling

**Firebase Integration:**

**Firebase Authentication:**
- `FirebaseAuth.createUserWithEmailAndPassword()` - Sign up
- `FirebaseAuth.signInWithEmailAndPassword()` - Login
- `FirebaseAuth.signInWithCredential()` - Social login
- `FirebaseAuth.verifyPhoneNumber()` - Phone authentication
- `FirebaseAuth.sendPasswordResetEmail()` - Password reset
- `FirebaseAuth.currentUser` - Get current user
- `FirebaseAuth.signOut()` - Logout

**Firestore:**
- **Collection**: `/users/{userId}`
- **Operations**:
  - Create user profile on signup
  - Update profile information
  - Store device tokens for notifications
  - Track last login

**Cloud Functions** (called from backend):
- `onUserCreate` - Initialize user data
- `sendWelcomeEmail` - Send welcome email after signup
- `sendVerificationEmail` - Send email verification

**Components:**

**Presentation Layer:**
- Login/SignUp UI screens
- ViewModels managing auth state
- Input validation
- Error handling
- Loading states

**Domain Layer:**
- Authentication use cases
- User domain model
- Repository interface

**Data Layer:**
- AuthRepositoryImpl interacts with Firebase Auth
- Local cache for user session
- Token management

**State Management:**
```
LoginState:
- Idle
- Loading
- Success (navigate to home)
- Error (show error message)
- ValidationError (show field errors)
```

---

### 4.2 Feature: Home Module

**Purpose**: App dashboard/homepage with featured content

**Package Structure:**
```
feature/home/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── HomeFragment.kt
│   │   ├── HomeViewModel.kt
│   │   ├── HomeState.kt
│   │   ├── adapter/
│   │   │   ├── BannerAdapter.kt
│   │   │   ├── CategoryAdapter.kt
│   │   │   ├── FeaturedProductsAdapter.kt
│   │   │   ├── DealsAdapter.kt
│   │   │   └── BestSellersAdapter.kt
│   │   └── viewholder/
│   │       └── ProductViewHolder.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Banner.kt
│   │   │   ├── HomeSection.kt
│   │   │   └── DealOfTheDay.kt
│   │   ├── usecase/
│   │   │   ├── GetHomeFeedUseCase.kt
│   │   │   ├── GetBannersUseCase.kt
│   │   │   ├── GetCategoriesUseCase.kt
│   │   │   ├── GetFeaturedProductsUseCase.kt
│   │   │   ├── GetBestSellersUseCase.kt
│   │   │   └── RefreshHomeDataUseCase.kt
│   │   └── repository/
│   │       └── HomeRepository.kt
│   └── data/
│       ├── repository/
│       │   └── HomeRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── HomeRemoteDataSource.kt
│       │   └── local/
│       │       └── HomeCacheDataSource.kt
│       └── mapper/
│           ├── BannerMapper.kt
│           └── HomeFeedMapper.kt
```

**Features:**

1. **Banner Carousel**
   - Auto-scrolling promotional banners
   - Click to navigate to products/categories
   - Image caching
   - Indicator dots

2. **Category Grid**
   - Display all categories
   - Category images/icons
   - Quick navigation to category products

3. **Featured Products**
   - Horizontal scrolling product list
   - "New Arrivals" section
   - "Trending Now" section
   - "Best Sellers" section

4. **Deals & Offers**
   - "Deal of the Day"
   - "Flash Sales" with countdown timer
   - "You May Like" (personalized recommendations)

5. **Search Bar**
   - Quick access to search
   - Search suggestions
   - Recent searches

6. **Pull to Refresh**
   - Refresh home feed
   - Update deals and offers

7. **Infinite Scroll**
   - Load more products as user scrolls
   - Pagination

**Firebase Integration:**

**Firestore Collections:**
- `/app_config/featured_banners` - Get banner images and links
- `/categories` - Fetch all active categories
- `/products` - Query for featured, trending, best sellers
  - `where('status', '==', 'published')`
  - `where('featured', '==', true)`
  - `orderBy('statistics.purchaseCount', 'desc')` for best sellers
  - `orderBy('createdAt', 'desc')` for new arrivals

**Firebase Remote Config:**
- Feature flags (enable/disable sections)
- Banner refresh interval
- Products per section
- Personalization settings

**Firebase Analytics:**
- Track banner clicks
- Track category views
- Track product impressions
- Track scroll depth

**Components:**

**Presentation:**
- Single HomeFragment with RecyclerView
- Multiple view types (banner, category, products)
- Adapters for each section
- ViewModel manages all home data

**Domain:**
- Use cases fetch different sections
- Home feed aggregation
- Business logic for personalization

**Data:**
- Repository coordinates multiple data sources
- Cache recent home feed
- Prefetch images

---

### 4.3 Feature: Products Module

**Purpose**: Product catalog, listing, filtering, and details

**Package Structure:**
```
feature/products/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── list/
│   │   │   ├── ProductListFragment.kt
│   │   │   ├── ProductListViewModel.kt
│   │   │   ├── ProductListState.kt
│   │   │   └── adapter/
│   │   │       ├── ProductAdapter.kt
│   │   │       └── ProductViewHolder.kt
│   │   ├── detail/
│   │   │   ├── ProductDetailFragment.kt
│   │   │   ├── ProductDetailViewModel.kt
│   │   │   ├── ProductDetailState.kt
│   │   │   └── adapter/
│   │   │       ├── ImageCarouselAdapter.kt
│   │   │       ├── VariantAdapter.kt
│   │   │       └── RelatedProductsAdapter.kt
│   │   ├── filter/
│   │   │   ├── FilterBottomSheet.kt
│   │   │   ├── FilterViewModel.kt
│   │   │   └── FilterState.kt
│   │   └── sort/
│   │       └── SortBottomSheet.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Product.kt
│   │   │   ├── ProductVariant.kt
│   │   │   ├── FilterOptions.kt
│   │   │   └── SortOption.kt
│   │   ├── usecase/
│   │   │   ├── GetProductsUseCase.kt
│   │   │   ├── GetProductByIdUseCase.kt
│   │   │   ├── GetProductsByCategoryUseCase.kt
│   │   │   ├── FilterProductsUseCase.kt
│   │   │   ├── SortProductsUseCase.kt
│   │   │   ├── GetProductVariantsUseCase.kt
│   │   │   ├── GetRelatedProductsUseCase.kt
│   │   │   └── TrackProductViewUseCase.kt
│   │   └── repository/
│   │       └── ProductRepository.kt
│   └── data/
│       ├── repository/
│       │   └── ProductRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── ProductRemoteDataSource.kt
│       │   └── local/
│       │       └── ProductCacheDataSource.kt
│       └── mapper/
│           ├── ProductMapper.kt
│           └── VariantMapper.kt
```

**Features:**

1. **Product Listing**
   - Grid/List view toggle
   - Pagination (load more)
   - Product cards with image, name, price, rating
   - Quick "Add to Cart" button
   - Wishlist heart icon
   - Sale/Discount badges
   - Out of stock indicators

2. **Product Detail Screen**
   - Image carousel (swipe through images)
   - Zoom on image tap
   - Product name and description
   - Price and discount
   - Star rating and review count
   - Available variants (size, color, etc.)
   - Stock availability
   - Add to cart/Buy now buttons
   - Share product button
   - Related products section
   - Customer reviews section

3. **Filtering**
   - Filter by category
   - Filter by price range (slider)
   - Filter by brand
   - Filter by rating
   - Filter by availability
   - Apply/Clear filters
   - Active filter chips

4. **Sorting**
   - Sort by popularity
   - Sort by newest
   - Sort by price: low to high
   - Sort by price: high to low
   - Sort by rating
   - Sort by discount percentage

5. **Variants Selection**
   - Size selection
   - Color selection
   - Update price based on variant
   - Update stock based on variant
   - Update images based on variant

6. **Product Actions**
   - Add to cart
   - Add to wishlist
   - Share product
   - Track product view

**Firebase Integration:**

**Firestore Queries:**

**Get Products by Category:**
```
/products
  .where('categoryId', '==', categoryId)
  .where('status', '==', 'published')
  .orderBy(sortField, sortDirection)
  .limit(20)
```

**Get Product Details:**
```
/products/{productId}
```

**Get Related Products:**
```
/products
  .where('categoryId', '==', sameCategoryId)
  .where('productId', '!=', currentProductId)
  .limit(6)
```

**Filter Products:**
```
/products
  .where('categoryId', '==', categoryId)
  .where('pricing.salePrice', '>=', minPrice)
  .where('pricing.salePrice', '<=', maxPrice)
  .where('ratings.averageRating', '>=', minRating)
```

**Track Product View (Cloud Function):**
```
Increment product view count:
products/{productId}/statistics/viewCount += 1

Add to recently viewed:
users/{userId}/recently_viewed/{productId}
```

**Firebase Analytics:**
- `view_item` - Track product views
- `select_content` - Track variant selection
- `add_to_cart` - Track add to cart
- `add_to_wishlist` - Track wishlist addition

**Components:**

**Presentation:**
- Product list with RecyclerView
- Product detail with ScrollView
- Filter/Sort bottom sheets
- ViewModels manage state

**Domain:**
- Product entity
- Use cases for CRUD operations
- Filtering and sorting logic

**Data:**
- Repository fetches from Firestore
- Local cache for offline viewing
- Image caching

---

### 4.4 Feature: Search Module

**Purpose**: Product search with filters and suggestions

**Package Structure:**
```
feature/search/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── SearchFragment.kt
│   │   ├── SearchViewModel.kt
│   │   ├── SearchState.kt
│   │   ├── adapter/
│   │   │   ├── SearchResultsAdapter.kt
│   │   │   ├── SearchSuggestionsAdapter.kt
│   │   │   └── RecentSearchesAdapter.kt
│   │   └── filter/
│   │       └── SearchFilterDialog.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── SearchQuery.kt
│   │   │   ├── SearchResult.kt
│   │   │   └── SearchSuggestion.kt
│   │   ├── usecase/
│   │   │   ├── SearchProductsUseCase.kt
│   │   │   ├── GetSearchSuggestionsUseCase.kt
│   │   │   ├── GetRecentSearchesUseCase.kt
│   │   │   ├── SaveSearchQueryUseCase.kt
│   │   │   ├── ClearSearchHistoryUseCase.kt
│   │   │   └── GetTrendingSearchesUseCase.kt
│   │   └── repository/
│   │       └── SearchRepository.kt
│   └── data/
│       ├── repository/
│       │   └── SearchRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── SearchRemoteDataSource.kt
│       │   └── local/
│       │       └── SearchHistoryDataSource.kt
│       └── mapper/
│           └── SearchMapper.kt
```

**Features:**

1. **Search Bar**
   - Search input field
   - Clear button
   - Voice search (optional)
   - Barcode scanner (optional)

2. **Search Suggestions**
   - Auto-complete suggestions
   - Query as user types (debounced)
   - Popular searches
   - Category suggestions

3. **Recent Searches**
   - Show recent search queries
   - Click to search again
   - Clear individual or all

4. **Search Results**
   - Product results
   - Category results
   - "No results" state
   - Pagination

5. **Search Filters**
   - Same filters as product listing
   - Narrow search results

6. **Trending Searches**
   - Show popular search terms
   - Updated periodically

**Firebase Integration:**

**Firestore Queries:**

**Basic Search (Firestore limitation: no full-text search):**
```
/products
  .where('tags', 'array-contains', searchTerm)
  .where('status', '==', 'published')
```

**Better Search Options:**

**Option 1: Algolia Integration** (Recommended for production)
- Sync Firestore products to Algolia
- Use Algolia SDK for search
- Fast, typo-tolerant search
- Faceted filtering

**Option 2: Cloud Functions + Firestore**
```
Cloud Function:
- Tokenize product names
- Store tokens in searchKeywords array
- Query: .where('searchKeywords', 'array-contains', keyword)
```

**Recent Searches:**
```
/users/{userId}/search_history
  .orderBy('timestamp', 'desc')
  .limit(10)
```

**Trending Searches (Analytics):**
```
/analytics_events
  .where('eventType', '==', 'search')
  .aggregated via Cloud Functions
  .stored in /app_config/trending_searches
```

**Firebase Analytics:**
- `search` - Track search queries
- `view_search_results` - Track search result views
- Track "no results" searches (to improve catalog)

**Components:**

**Presentation:**
- Search screen with input
- Results RecyclerView
- Suggestions dropdown
- Recent searches list

**Domain:**
- Search use cases
- Query building
- Result ranking

**Data:**
- Search via Firestore or Algolia
- Cache recent searches locally
- Store search history in Firestore

---

### 4.5 Feature: Cart Module

**Purpose**: Shopping cart management

**Package Structure:**
```
feature/cart/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── CartFragment.kt
│   │   ├── CartViewModel.kt
│   │   ├── CartState.kt
│   │   ├── adapter/
│   │   │   ├── CartItemsAdapter.kt
│   │   │   └── CartItemViewHolder.kt
│   │   └── dialog/
│   │       └── RemoveItemDialog.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Cart.kt
│   │   │   ├── CartItem.kt
│   │   │   └── CartSummary.kt
│   │   ├── usecase/
│   │   │   ├── GetCartUseCase.kt
│   │   │   ├── AddToCartUseCase.kt
│   │   │   ├── UpdateCartItemUseCase.kt
│   │   │   ├── RemoveFromCartUseCase.kt
│   │   │   ├── ClearCartUseCase.kt
│   │   │   ├── CalculateCartTotalUseCase.kt
│   │   │   ├── ApplyCouponUseCase.kt
│   │   │   └── ValidateCartUseCase.kt
│   │   └── repository/
│   │       └── CartRepository.kt
│   └── data/
│       ├── repository/
│       │   └── CartRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── CartRemoteDataSource.kt
│       │   └── local/
│       │       └── CartLocalDataSource.kt
│       └── mapper/
│           └── CartMapper.kt
```

**Features:**

1. **Cart Display**
   - List of cart items
   - Product image, name, variant
   - Price (including discounts)
   - Quantity selector (+/- buttons)
   - Remove item button
   - Stock status per item
   - Cart empty state

2. **Quantity Management**
   - Increase quantity
   - Decrease quantity
   - Manual quantity input
   - Max quantity validation
   - Stock availability check

3. **Cart Summary**
   - Subtotal
   - Discount (if applied)
   - Estimated tax
   - Estimated shipping
   - Grand total
   - Items count

4. **Coupon Application**
   - Coupon code input
   - Apply/Remove coupon
   - Show discount applied
   - Coupon validation errors

5. **Cart Actions**
   - Continue shopping
   - Proceed to checkout
   - Clear cart
   - Save for later (move to wishlist)

6. **Real-time Updates**
   - Sync cart across devices
   - Price updates
   - Stock availability updates
   - Auto-remove out-of-stock items

**Firebase Integration:**

**Firestore:**

**Get Cart:**
```
/carts/{userId}
Real-time listener for cart changes
```

**Add to Cart:**
```
/carts/{userId}
  .update({
    items: FieldValue.arrayUnion(newItem)
  })
```

**Update Cart Item:**
```
/carts/{userId}
  .update({
    'items[index].quantity': newQuantity
  })
```

**Remove from Cart:**
```
/carts/{userId}
  .update({
    items: FieldValue.arrayRemove(item)
  })
```

**Apply Coupon (Cloud Function):**
```
validateCoupon(userId, couponCode)
Returns: discount amount, validity
```

**Firebase Analytics:**
- `add_to_cart` - Track items added
- `remove_from_cart` - Track items removed
- `view_cart` - Track cart views
- `begin_checkout` - Track checkout start

**Cloud Functions:**
- `validateCart` - Check stock, prices before checkout
- `applyCoupon` - Validate and apply coupon
- `calculateTotal` - Server-side total calculation (prevent tampering)

**Components:**

**Presentation:**
- Cart screen with list
- Cart summary card
- Coupon input
- ViewModels manage cart state

**Domain:**
- Cart and CartItem models
- Add/Remove/Update use cases
- Cart validation
- Total calculation

**Data:**
- Repository syncs with Firestore
- Local cache for offline
- Real-time listeners

---

### 4.6 Feature: Checkout Module

**Purpose**: Order placement and payment processing

**Package Structure:**
```
feature/checkout/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── shipping/
│   │   │   ├── ShippingAddressFragment.kt
│   │   │   ├── ShippingAddressViewModel.kt
│   │   │   ├── AddressListFragment.kt
│   │   │   └── AddAddressDialog.kt
│   │   ├── payment/
│   │   │   ├── PaymentMethodFragment.kt
│   │   │   ├── PaymentMethodViewModel.kt
│   │   │   └── PaymentMethodAdapter.kt
│   │   ├── review/
│   │   │   ├── OrderReviewFragment.kt
│   │   │   ├── OrderReviewViewModel.kt
│   │   │   └── OrderSummaryView.kt
│   │   └── success/
│   │       ├── OrderSuccessFragment.kt
│   │       └── OrderSuccessViewModel.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── ShippingAddress.kt
│   │   │   ├── PaymentMethod.kt
│   │   │   ├── Order.kt
│   │   │   └── OrderItem.kt
│   │   ├── usecase/
│   │   │   ├── GetSavedAddressesUseCase.kt
│   │   │   ├── AddAddressUseCase.kt
│   │   │   ├── SelectAddressUseCase.kt
│   │   │   ├── GetPaymentMethodsUseCase.kt
│   │   │   ├── SelectPaymentMethodUseCase.kt
│   │   │   ├── CalculateShippingUseCase.kt
│   │   │   ├── PlaceOrderUseCase.kt
│   │   │   ├── ProcessPaymentUseCase.kt
│   │   │   └── ValidateCheckoutUseCase.kt
│   │   └── repository/
│   │       ├── CheckoutRepository.kt
│   │       └── PaymentRepository.kt
│   └── data/
│       ├── repository/
│       │   ├── CheckoutRepositoryImpl.kt
│       │   └── PaymentRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   ├── CheckoutRemoteDataSource.kt
│       │   │   └── PaymentGatewayDataSource.kt
│       │   └── local/
│       │       └── CheckoutCacheDataSource.kt
│       └── mapper/
│           ├── AddressMapper.kt
│           └── OrderMapper.kt
```

**Features:**

1. **Shipping Address Selection**
   - List saved addresses
   - Select shipping address
   - Add new address
   - Edit existing address
   - Set default address
   - Address validation (format, postal code)

2. **Shipping Method Selection**
   - Display available shipping methods
   - Show estimated delivery dates
   - Show shipping costs
   - Select shipping method

3. **Payment Method Selection**
   - Display available payment methods
   - Credit/Debit card
   - Digital wallets (Google Pay, PayPal)
   - UPI (for India)
   - Cash on Delivery (COD)
   - Saved payment methods
   - Add new payment method

4. **Order Review**
   - Display cart items
   - Show selected address
   - Show selected payment method
   - Show order summary (pricing)
   - Apply/Remove coupon
   - Terms and conditions checkbox
   - Place order button

5. **Payment Processing**
   - Integrate payment gateway
   - Secure payment flow
   - 3D Secure authentication
   - Payment success/failure handling
   - Retry payment option

6. **Order Confirmation**
   - Order success message
   - Order ID and details
   - Estimated delivery date
   - Track order button
   - Continue shopping button
   - Share order details

**Firebase Integration:**

**Firestore:**

**Get Saved Addresses:**
```
/users/{userId}/addresses
  .where('deletedAt', '==', null)
  .orderBy('isDefault', 'desc')
```

**Add Address:**
```
/users/{userId}/addresses
  .add(addressData)
```

**Calculate Shipping (Cloud Function):**
```
calculateShipping(userId, addressId, cartItems)
Returns: shipping methods with costs and estimates
```

**Place Order (Cloud Function):**
```
placeOrder(userId, orderData)
Steps:
1. Validate cart (stock, prices)
2. Apply coupon
3. Calculate final total
4. Create order document
5. Reduce product stock
6. Clear cart
7. Send confirmation
Returns: orderId, paymentDetails
```

**Create Order:**
```
/orders
  .add(orderData)
```

**Process Payment (via Payment Gateway + Cloud Function):**
```
processPayment(orderId, paymentMethod, amount)
Steps:
1. Create payment intent with gateway
2. Process payment
3. Update order payment status
4. Send confirmation email
5. Send push notification
Returns: payment status
```

**Firebase Analytics:**
- `begin_checkout` - Checkout started
- `add_shipping_info` - Address selected
- `add_payment_info` - Payment method selected
- `purchase` - Order placed (with transaction details)

**Cloud Functions:**
- `calculateShipping` - Calculate shipping based on location and cart
- `validateCheckout` - Pre-checkout validation
- `placeOrder` - Create order (server-side for security)
- `processPayment` - Handle payment with gateway
- `sendOrderConfirmation` - Email and push notification
- `updateInventory` - Reduce stock after order

**Components:**

**Presentation:**
- Multi-step checkout flow
- Address selection screen
- Payment method screen
- Order review screen
- Success screen

**Domain:**
- Order creation logic
- Shipping calculation
- Payment processing
- Validation

**Data:**
- Repository for checkout operations
- Payment gateway integration
- Firestore for order creation

---

### 4.7 Feature: Orders Module

**Purpose**: Order history and tracking

**Package Structure:**
```
feature/orders/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── list/
│   │   │   ├── OrderListFragment.kt
│   │   │   ├── OrderListViewModel.kt
│   │   │   ├── OrderListState.kt
│   │   │   └── adapter/
│   │   │       ├── OrdersAdapter.kt
│   │   │       └── OrderViewHolder.kt
│   │   ├── detail/
│   │   │   ├── OrderDetailFragment.kt
│   │   │   ├── OrderDetailViewModel.kt
│   │   │   ├── OrderDetailState.kt
│   │   │   └── adapter/
│   │   │       └── OrderItemsAdapter.kt
│   │   ├── tracking/
│   │   │   ├── OrderTrackingFragment.kt
│   │   │   ├── OrderTrackingViewModel.kt
│   │   │   └── TrackingTimelineView.kt
│   │   └── cancel/
│   │       └── CancelOrderDialog.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Order.kt
│   │   │   ├── OrderStatus.kt
│   │   │   └── TrackingInfo.kt
│   │   ├── usecase/
│   │   │   ├── GetOrdersUseCase.kt
│   │   │   ├── GetOrderByIdUseCase.kt
│   │   │   ├── TrackOrderUseCase.kt
│   │   │   ├── CancelOrderUseCase.kt
│   │   │   ├── RequestReturnUseCase.kt
│   │   │   ├── DownloadInvoiceUseCase.kt
│   │   │   └── ReorderUseCase.kt
│   │   └── repository/
│   │       └── OrderRepository.kt
│   └── data/
│       ├── repository/
│       │   └── OrderRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── OrderRemoteDataSource.kt
│       │   └── local/
│       │       └── OrderCacheDataSource.kt
│       └── mapper/
│           └── OrderMapper.kt
```

**Features:**

1. **Order List**
   - Display all orders
   - Group by status (Active, Delivered, Cancelled)
   - Order cards with:
     - Order ID
     - Order date
     - Total amount
     - Status badge
     - Primary product image
     - Items count
   - Pull to refresh
   - Filter orders (by status, date range)

2. **Order Details**
   - Order ID and date
   - Status timeline
   - Order items list
   - Shipping address
   - Payment method
   - Order summary (pricing breakdown)
   - Invoice download
   - Track order button
   - Help/Contact support

3. **Order Tracking**
   - Real-time tracking status
   - Timeline view (ordered → packed → shipped → delivered)
   - Estimated delivery date
   - Tracking number
   - Carrier information
   - Track on carrier website

4. **Order Actions**
   - Cancel order (if eligible)
   - Return/Refund request (if eligible)
   - Reorder (add items to cart again)
   - Rate and review products
   - Download invoice
   - Contact support

5. **Order Filters**
   - All orders
   - Pending orders
   - Delivered orders
   - Cancelled orders
   - Date range filter

**Firebase Integration:**

**Firestore:**

**Get User Orders:**
```
/orders
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(20)

Real-time listener for order status updates
```

**Get Order Details:**
```
/orders/{orderId}

Real-time listener for live tracking updates
```

**Track Order:**
```
/orders/{orderId}/tracking_updates
  .orderBy('timestamp', 'desc')
```

**Cancel Order (Cloud Function):**
```
cancelOrder(userId, orderId, reason)
Steps:
1. Check if cancellation allowed
2. Update order status
3. Initiate refund (if payment made)
4. Restore product stock
5. Send cancellation email
Returns: cancellation status
```

**Request Return (Cloud Function):**
```
requestReturn(userId, orderId, items, reason)
Steps:
1. Validate return eligibility
2. Create return request
3. Notify admin
4. Send return instructions
Returns: return request ID
```

**Firebase Analytics:**
- `view_item_list` - Orders list viewed
- `select_content` - Order clicked
- `view_item` - Order details viewed
- Track cancellation rate
- Track return rate

**Cloud Functions:**
- `updateOrderStatus` - Status updates from admin/system
- `cancelOrder` - Handle cancellation
- `processReturn` - Handle return requests
- `generateInvoice` - Create PDF invoice
- `sendTrackingUpdate` - Push notification on status change

**Components:**

**Presentation:**
- Order list screen
- Order detail screen
- Tracking timeline
- Cancel/Return dialogs

**Domain:**
- Order model
- Order status enum
- Tracking use cases

**Data:**
- Repository for order operations
- Real-time listeners for updates
- Local cache for offline viewing

---

### 4.8 Feature: Profile Module

**Purpose**: User profile management and settings

**Package Structure:**
```
feature/profile/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── profile/
│   │   │   ├── ProfileFragment.kt
│   │   │   ├── ProfileViewModel.kt
│   │   │   └── ProfileState.kt
│   │   ├── edit/
│   │   │   ├── EditProfileFragment.kt
│   │   │   └── EditProfileViewModel.kt
│   │   ├── settings/
│   │   │   ├── SettingsFragment.kt
│   │   │   └── SettingsViewModel.kt
│   │   ├── addresses/
│   │   │   ├── AddressListFragment.kt
│   │   │   └── ManageAddressViewModel.kt
│   │   ├── payment_methods/
│   │   │   ├── PaymentMethodsFragment.kt
│   │   │   └── PaymentMethodsViewModel.kt
│   │   └── loyalty/
│   │       ├── LoyaltyFragment.kt
│   │       └── LoyaltyViewModel.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── UserProfile.kt
│   │   │   ├── Address.kt
│   │   │   └── LoyaltyInfo.kt
│   │   ├── usecase/
│   │   │   ├── GetProfileUseCase.kt
│   │   │   ├── UpdateProfileUseCase.kt
│   │   │   ├── UploadProfileImageUseCase.kt
│   │   │   ├── ChangePasswordUseCase.kt
│   │   │   ├── GetAddressesUseCase.kt
│   │   │   ├── ManageAddressUseCase.kt
│   │   │   ├── GetLoyaltyInfoUseCase.kt
│   │   │   ├── LogoutUseCase.kt
│   │   │   └── DeleteAccountUseCase.kt
│   │   └── repository/
│   │       └── ProfileRepository.kt
│   └── data/
│       ├── repository/
│       │   └── ProfileRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── ProfileRemoteDataSource.kt
│       │   └── local/
│       │       └── ProfileLocalDataSource.kt
│       └── mapper/
│           └── ProfileMapper.kt
```

**Features:**

1. **Profile View**
   - Profile picture
   - Name and email
   - Phone number
   - Loyalty points/tier
   - Account statistics (orders, spent, etc.)
   - Edit profile button

2. **Edit Profile**
   - Change profile picture
   - Edit name
   - Edit email (with verification)
   - Edit phone number
   - Edit date of birth
   - Edit gender
   - Save changes

3. **Settings**
   - Notification preferences
     - Push notifications toggle
     - Email notifications toggle
     - SMS notifications toggle
   - Language selection
   - Theme selection (light/dark/auto)
   - Currency selection
   - App version info
   - Terms and conditions
   - Privacy policy
   - About us

4. **Manage Addresses**
   - View saved addresses
   - Add new address
   - Edit address
   - Delete address
   - Set default address

5. **Manage Payment Methods**
   - View saved payment methods
   - Add new payment method
   - Remove payment method
   - Set default payment method

6. **Loyalty & Rewards**
   - Current points balance
   - Loyalty tier
   - Points history
   - Rewards catalog
   - Redeem points
   - Referral code
   - Refer friends

7. **Account Management**
   - Change password
   - Logout
   - Delete account
   - Download my data

**Firebase Integration:**

**Firestore:**

**Get Profile:**
```
/users/{userId}

Real-time listener for profile updates
```

**Update Profile:**
```
/users/{userId}
  .update(profileData)
```

**Upload Profile Image:**
```
Firebase Storage:
/users/{userId}/profile.jpg

Then update Firestore:
/users/{userId}
  .update({ profileImageUrl: downloadUrl })
```

**Get Addresses:**
```
/users/{userId}/addresses
```

**Update Notification Preferences:**
```
/users/{userId}
  .update({
    'preferences.pushNotifications': true,
    'preferences.emailNotifications': false
  })
```

**Get Loyalty Info:**
```
/users/{userId}
  .get(['loyaltyPoints', 'rewardsTier'])

/loyalty_transactions
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
```

**Change Password:**
```
Firebase Auth:
currentUser.updatePassword(newPassword)
```

**Delete Account (Cloud Function):**
```
deleteAccount(userId)
Steps:
1. Delete user data from Firestore
2. Delete user images from Storage
3. Anonymize order history
4. Delete Firebase Auth account
5. Send confirmation email
```

**Firebase Analytics:**
- `view_profile` - Profile viewed
- `edit_profile` - Profile edited
- Track feature usage in settings

**Cloud Functions:**
- `updateUserProfile` - Validate and update profile
- `deleteUserAccount` - Handle account deletion
- `calculateLoyaltyPoints` - Update points balance

**Components:**

**Presentation:**
- Profile screen
- Edit profile screen
- Settings screen
- Address management
- Loyalty screen

**Domain:**
- User profile model
- Update profile use cases
- Account management

**Data:**
- Repository for profile operations
- Firebase Auth for password change
- Firebase Storage for images

---

### 4.9 Feature: Wishlist Module

**Purpose**: Save favorite products for later

**Package Structure:**
```
feature/wishlist/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── WishlistFragment.kt
│   │   ├── WishlistViewModel.kt
│   │   ├── WishlistState.kt
│   │   └── adapter/
│   │       ├── WishlistAdapter.kt
│   │       └── WishlistItemViewHolder.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Wishlist.kt
│   │   │   └── WishlistItem.kt
│   │   ├── usecase/
│   │   │   ├── GetWishlistUseCase.kt
│   │   │   ├── AddToWishlistUseCase.kt
│   │   │   ├── RemoveFromWishlistUseCase.kt
│   │   │   ├── MoveToCartUseCase.kt
│   │   │   ├── CheckIfInWishlistUseCase.kt
│   │   │   └── ClearWishlistUseCase.kt
│   │   └── repository/
│   │       └── WishlistRepository.kt
│   └── data/
│       ├── repository/
│       │   └── WishlistRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── WishlistRemoteDataSource.kt
│       │   └── local/
│       │       └── WishlistLocalDataSource.kt
│       └── mapper/
│           └── WishlistMapper.kt
```

**Features:**

1. **Wishlist Display**
   - Grid of wishlist products
   - Product image, name, price
   - Stock status
   - Price drop indicator
   - Remove from wishlist button
   - Add to cart button
   - Empty wishlist state

2. **Add to Wishlist**
   - Heart icon on product cards
   - Add from product detail
   - Confirmation feedback

3. **Remove from Wishlist**
   - Swipe to delete
   - Remove button
   - Undo option

4. **Move to Cart**
   - Move single item to cart
   - Move all items to cart

5. **Price Alerts**
   - Enable price drop notifications
   - Back-in-stock notifications

6. **Wishlist Sharing** (optional)
   - Share wishlist link
   - Public/Private toggle

**Firebase Integration:**

**Firestore:**

**Get Wishlist:**
```
/wishlists/{userId}

Real-time listener for wishlist updates
```

**Add to Wishlist:**
```
/wishlists/{userId}
  .update({
    items: FieldValue.arrayUnion(newItem)
  })
```

**Remove from Wishlist:**
```
/wishlists/{userId}
  .update({
    items: FieldValue.arrayRemove(item)
  })
```

**Price Drop Check (Cloud Function - Scheduled):**
```
checkPriceDrops()
Runs daily:
1. Compare current price with price when added
2. If price dropped, send notification
3. Update item with new price
```

**Firebase Analytics:**
- `add_to_wishlist` - Item added
- `remove_from_wishlist` - Item removed
- Track wishlist conversion rate

**Components:**

**Presentation:**
- Wishlist screen
- Grid layout
- Add/Remove actions

**Domain:**
- Wishlist model
- Add/Remove use cases

**Data:**
- Repository for wishlist
- Real-time sync
- Local cache

---

### 4.10 Feature: Reviews Module

**Purpose**: Product reviews and ratings

**Package Structure:**
```
feature/reviews/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── list/
│   │   │   ├── ReviewListFragment.kt
│   │   │   ├── ReviewListViewModel.kt
│   │   │   └── adapter/
│   │   │       ├── ReviewsAdapter.kt
│   │   │       └── ReviewViewHolder.kt
│   │   ├── write/
│   │   │   ├── WriteReviewFragment.kt
│   │   │   ├── WriteReviewViewModel.kt
│   │   │   └── WriteReviewState.kt
│   │   └── images/
│   │       └── ReviewImagesDialog.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Review.kt
│   │   │   └── ReviewRating.kt
│   │   ├── usecase/
│   │   │   ├── GetReviewsUseCase.kt
│   │   │   ├── GetMyReviewsUseCase.kt
│   │   │   ├── WriteReviewUseCase.kt
│   │   │   ├── UpdateReviewUseCase.kt
│   │   │   ├── DeleteReviewUseCase.kt
│   │   │   ├── UploadReviewImagesUseCase.kt
│   │   │   ├── VoteReviewHelpfulUseCase.kt
│   │   │   └── ReportReviewUseCase.kt
│   │   └── repository/
│   │       └── ReviewRepository.kt
│   └── data/
│       ├── repository/
│       │   └── ReviewRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── ReviewRemoteDataSource.kt
│       │   └── local/
│       │       └── ReviewCacheDataSource.kt
│       └── mapper/
│           └── ReviewMapper.kt
```

**Features:**

1. **Review List**
   - Display all reviews for product
   - Reviewer name and profile picture
   - Star rating
   - Review text
   - Review images
   - Verified purchase badge
   - Helpful votes count
   - Review date
   - Filter by rating (5-star, 4-star, etc.)
   - Sort by (Most recent, Most helpful, Highest/Lowest rating)

2. **Write Review**
   - Star rating selector (1-5)
   - Review title input
   - Review text input
   - Upload images (up to 5)
   - Recommend product checkbox
   - Submit button
   - Only for purchased products

3. **Review Actions**
   - Mark review as helpful
   - Report inappropriate review
   - Edit own review
   - Delete own review

4. **Review Summary**
   - Average rating
   - Total review count
   - Rating distribution (bar chart)
   - Percentage would recommend

**Firebase Integration:**

**Firestore:**

**Get Product Reviews:**
```
/product_reviews
  .where('productId', '==', productId)
  .where('status', '==', 'approved')
  .orderBy('createdAt', 'desc')
  .limit(20)
```

**Write Review:**
```
/product_reviews
  .add(reviewData)

Status: 'pending' (requires moderation)
```

**Upload Review Images:**
```
Firebase Storage:
/reviews/{reviewId}/image_{index}.jpg

Then update review document with image URLs
```

**Vote Helpful:**
```
/product_reviews/{reviewId}
  .update({
    helpfulCount: FieldValue.increment(1)
  })

Track in subcollection:
/product_reviews/{reviewId}/votes/{userId}
```

**Update Product Rating (Cloud Function):**
```
onReviewApproved(reviewId)
Steps:
1. Calculate new average rating
2. Update rating distribution
3. Update product document
4. Notify product owner
```

**Firebase Analytics:**
- `write_review` - Review submitted
- `view_reviews` - Reviews viewed
- Track review completion rate

**Cloud Functions:**
- `moderateReview` - Auto-moderation (profanity check)
- `updateProductRating` - Recalculate product rating
- `notifyReviewApproval` - Notify user when review approved
- `awardLoyaltyPoints` - Give points for writing review

**Components:**

**Presentation:**
- Review list screen
- Write review screen
- Image gallery
- Rating selector

**Domain:**
- Review model
- Submit review use case
- Voting logic

**Data:**
- Repository for reviews
- Image upload to Storage
- Firestore operations

---

### 4.11 Feature: Notifications Module

**Purpose**: In-app notifications center

**Package Structure:**
```
feature/notifications/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── NotificationsFragment.kt
│   │   ├── NotificationsViewModel.kt
│   │   ├── NotificationsState.kt
│   │   └── adapter/
│   │       ├── NotificationsAdapter.kt
│   │       └── NotificationViewHolder.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Notification.kt
│   │   │   └── NotificationType.kt
│   │   ├── usecase/
│   │   │   ├── GetNotificationsUseCase.kt
│   │   │   ├── MarkAsReadUseCase.kt
│   │   │   ├── MarkAllAsReadUseCase.kt
│   │   │   ├── DeleteNotificationUseCase.kt
│   │   │   ├── ClearAllNotificationsUseCase.kt
│   │   │   └── GetUnreadCountUseCase.kt
│   │   └── repository/
│   │       └── NotificationRepository.kt
│   ├── data/
│   │   ├── repository/
│   │   │   └── NotificationRepositoryImpl.kt
│   │   ├── source/
│   │   │   ├── remote/
│   │   │   │   └── NotificationRemoteDataSource.kt
│   │   │   └── local/
│   │   │       └── NotificationLocalDataSource.kt
│   │   └── mapper/
│   │       └── NotificationMapper.kt
│   └── fcm/
│       ├── MyFirebaseMessagingService.kt    # FCM service
│       ├── NotificationHandler.kt           # Handle notifications
│       └── NotificationChannels.kt          # Notification channels
```

**Features:**

1. **Notification List**
   - List all notifications
   - Group by date (Today, Yesterday, Earlier)
   - Notification icon/image
   - Title and message
   - Timestamp
   - Read/Unread indicator
   - Swipe to delete

2. **Notification Types**
   - Order updates (placed, shipped, delivered)
   - Payment confirmations
   - Promotional offers
   - Price drop alerts
   - Back in stock alerts
   - Wishlist reminders
   - Account updates

3. **Notification Actions**
   - Tap to navigate to relevant screen
   - Mark as read/unread
   - Delete notification
   - Clear all notifications

4. **Notification Badge**
   - Unread count badge on tab/icon
   - Update in real-time

5. **Push Notifications**
   - Receive FCM push notifications
   - Display system notification
   - Handle notification tap
   - Background/Foreground handling

**Firebase Integration:**

**Firestore:**

**Get Notifications:**
```
/users/{userId}/notifications
  .orderBy('createdAt', 'desc')
  .limit(50)

Real-time listener for new notifications
```

**Mark as Read:**
```
/users/{userId}/notifications/{notificationId}
  .update({
    read: true,
    readAt: FieldValue.serverTimestamp()
  })
```

**Delete Notification:**
```
/users/{userId}/notifications/{notificationId}
  .delete()
```

**Firebase Cloud Messaging (FCM):**

**Send Notification (Cloud Function):**
```
sendNotification(userId, notificationData)
Steps:
1. Get user's device tokens
2. Send FCM message
3. Store notification in Firestore
4. Increment unread count
```

**Device Token Management:**
```
Store in:
/users/{userId}
  .update({
    deviceTokens: FieldValue.arrayUnion(newToken)
  })

Remove on logout/uninstall:
  .update({
    deviceTokens: FieldValue.arrayRemove(oldToken)
  })
```

**Notification Types (FCM Topics):**
```
Subscribe to topics:
- fcm.subscribeToTopic('promotional_offers')
- fcm.subscribeToTopic('order_updates')

Send to topic:
messaging.sendToTopic('promotional_offers', message)
```

**Firebase Analytics:**
- `notification_received` - Notification received
- `notification_opened` - Notification tapped
- Track notification engagement

**Cloud Functions:**
- `sendOrderStatusNotification` - On order status change
- `sendPromotionalNotification` - Scheduled campaigns
- `sendPriceDropNotification` - On price drop detected
- `sendAbandonedCartReminder` - 24 hours after cart abandonment

**Components:**

**Presentation:**
- Notifications list screen
- Notification cards
- Badge on tab

**Domain:**
- Notification model
- Mark read use case
- Delete use case

**Data:**
- Repository for notifications
- FCM service for push
- Real-time listener

**FCM Service:**
- Handle incoming notifications
- Display system notifications
- Navigate on tap

---

### 4.12 Feature: Support Module

**Purpose**: Customer support and help center

**Package Structure:**
```
feature/support/
├── src/main/kotlin/
│   ├── presentation/
│   │   ├── main/
│   │   │   ├── SupportFragment.kt
│   │   │   └── SupportViewModel.kt
│   │   ├── faq/
│   │   │   ├── FaqFragment.kt
│   │   │   ├── FaqViewModel.kt
│   │   │   └── adapter/
│   │   │       └── FaqAdapter.kt
│   │   ├── ticket/
│   │   │   ├── CreateTicketFragment.kt
│   │   │   ├── TicketListFragment.kt
│   │   │   ├── TicketDetailFragment.kt
│   │   │   └── TicketViewModel.kt
│   │   ├── chat/
│   │   │   ├── ChatFragment.kt
│   │   │   ├── ChatViewModel.kt
│   │   │   └── adapter/
│   │   │       └── ChatAdapter.kt
│   │   └── contact/
│   │       └── ContactOptionsDialog.kt
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Faq.kt
│   │   │   ├── SupportTicket.kt
│   │   │   └── ChatMessage.kt
│   │   ├── usecase/
│   │   │   ├── GetFaqsUseCase.kt
│   │   │   ├── SearchFaqUseCase.kt
│   │   │   ├── CreateTicketUseCase.kt
│   │   │   ├── GetTicketsUseCase.kt
│   │   │   ├── GetTicketDetailsUseCase.kt
│   │   │   ├── SendMessageUseCase.kt
│   │   │   └── CallSupportUseCase.kt
│   │   └── repository/
│   │       └── SupportRepository.kt
│   └── data/
│       ├── repository/
│       │   └── SupportRepositoryImpl.kt
│       ├── source/
│       │   ├── remote/
│       │   │   └── SupportRemoteDataSource.kt
│       │   └── local/
│       │       └── SupportCacheDataSource.kt
│       └── mapper/
│           └── SupportMapper.kt
```

**Features:**

1. **Support Options**
   - Browse FAQs
   - Create support ticket
   - Live chat (if available)
   - Call support
   - Email support
   - Order-specific help

2. **FAQ Section**
   - Categories (Account, Orders, Payments, Shipping, Returns)
   - Searchable FAQs
   - Expandable Q&A
   - "Was this helpful?" feedback

3. **Support Tickets**
   - Create ticket with details
   - Upload screenshots
   - Select category
   - View open tickets
   - View ticket history
   - Ticket status tracking
   - Reply to tickets

4. **Live Chat** (optional)
   - Real-time chat with support agent
   - Send text messages
   - Send images
   - Typing indicator
   - Chat history

5. **Contact Support**
   - Phone support (click to call)
   - Email support (open email app)
   - WhatsApp support (if available)
   - Social media links

**Firebase Integration:**

**Firestore:**

**Get FAQs:**
```
/app_config/faqs
  .where('status', '==', 'active')
  .orderBy('displayOrder')
```

**Create Support Ticket:**
```
/support_tickets
  .add(ticketData)
```

**Get User Tickets:**
```
/support_tickets
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
```

**Get Ticket Details:**
```
/support_tickets/{ticketId}

Subcollection for messages:
/support_tickets/{ticketId}/messages
  .orderBy('timestamp')

Real-time listener for new messages
```

**Send Message:**
```
/support_tickets/{ticketId}/messages
  .add(messageData)
```

**Upload Attachment:**
```
Firebase Storage:
/support_tickets/{ticketId}/attachments/{fileName}

Store URL in message document
```

**Firebase Analytics:**
- `view_faq` - FAQ viewed
- `contact_support` - Support contacted
- Track common issues

**Cloud Functions:**
- `notifyAgentNewTicket` - Notify support team
- `autoReplyTicket` - Send auto-reply
- `escalateTicket` - Auto-escalate urgent tickets
- `sendTicketUpdate` - Notify user of ticket updates

**Components:**

**Presentation:**
- Support home screen
- FAQ list
- Ticket list
- Ticket detail/chat
- Create ticket form

**Domain:**
- FAQ model
- Ticket model
- Support use cases

**Data:**
- Repository for support
- Real-time chat
- Image uploads

---

## 5. Shared Modules

### 5.1 Shared UI Module

**Purpose**: Reusable UI components across features

**Package Structure:**
```
shared/ui/
├── src/main/kotlin/
│   ├── components/
│   │   ├── buttons/
│   │   │   ├── PrimaryButton.kt
│   │   │   ├── SecondaryButton.kt
│   │   │   └── IconButton.kt
│   │   ├── cards/
│   │   │   ├── ProductCard.kt
│   │   │   ├── OrderCard.kt
│   │   │   └── CategoryCard.kt
│   │   ├── inputs/
│   │   │   ├── CustomTextField.kt
│   │   │   ├── SearchBar.kt
│   │   │   ├── DropdownField.kt
│   │   │   └── OtpInputField.kt
│   │   ├── loading/
│   │   │   ├── LoadingView.kt
│   │   │   ├── ShimmerView.kt
│   │   │   └── ProgressBar.kt
│   │   ├── empty/
│   │   │   ├── EmptyStateView.kt
│   │   │   └── ErrorView.kt
│   │   ├── badges/
│   │   │   ├── DiscountBadge.kt
│   │   │   ├── StatusBadge.kt
│   │   │   └── NotificationBadge.kt
│   │   ├── rating/
│   │   │   ├── RatingBar.kt
│   │   │   └── RatingDisplay.kt
│   │   ├── image/
│   │   │   ├── NetworkImage.kt
│   │   │   ├── RoundedImage.kt
│   │   │   └── ImageCarousel.kt
│   │   └── dialogs/
│   │       ├── ConfirmDialog.kt
│   │       ├── AlertDialog.kt
│   │       └── LoadingDialog.kt
│   ├── theme/
│   │   ├── Color.kt
│   │   ├── Type.kt
│   │   ├── Shape.kt
│   │   └── Theme.kt
│   └── utils/
│       ├── ViewExtensions.kt
│       └── ImageLoader.kt
```

**Components:**

1. **Buttons**
   - Primary button (filled)
   - Secondary button (outlined)
   - Text button
   - Icon button
   - Loading button state

2. **Cards**
   - Product card (reused in home, products, search)
   - Order card (reused in orders)
   - Category card
   - Review card

3. **Input Fields**
   - Text input with validation
   - Email input
   - Password input (with visibility toggle)
   - Phone number input
   - Search bar
   - Dropdown/Spinner
   - Date picker
   - OTP input

4. **Loading States**
   - Loading spinner
   - Shimmer loading (skeleton screen)
   - Progress bar
   - Loading dialog

5. **Empty States**
   - Empty cart
   - No results found
   - No orders yet
   - Error screen

6. **Badges**
   - Discount badge
   - New arrival badge
   - Out of stock badge
   - Status badges (pending, shipped, etc.)
   - Notification count badge

7. **Rating**
   - Interactive rating bar (for writing reviews)
   - Display-only rating stars
   - Rating distribution chart

8. **Images**
   - Network image with caching (Coil)
   - Rounded/Circular images
   - Image carousel
   - Placeholder images
   - Error images

9. **Dialogs**
   - Confirmation dialog
   - Alert dialog
   - Loading dialog
   - Custom dialogs

10. **Bottom Sheets**
    - Filter bottom sheet
    - Sort bottom sheet
    - Options bottom sheet

**Theme:**
- Colors (primary, secondary, background, surface, error)
- Typography (font families, text styles)
- Shapes (corner radius)
- Dimensions (spacing, sizes)
- Material Design 3 theming

---

### 5.2 Shared Domain Module

**Purpose**: Shared domain models and interfaces

**Package Structure:**
```
shared/domain/
├── src/main/kotlin/
│   ├── model/
│   │   ├── Product.kt
│   │   ├── User.kt
│   │   ├── Order.kt
│   │   ├── Category.kt
│   │   ├── Address.kt
│   │   └── Price.kt
│   ├── repository/
│   │   └── BaseRepository.kt
│   └── usecase/
│       └── BaseUseCase.kt
```

**Components:**

1. **Common Models**
   - Models shared across multiple features
   - Domain-level entities
   - Business objects

2. **Repository Interfaces**
   - Base repository interface
   - Common repository methods

3. **Base Use Case**
   - Abstract use case class
   - Common execution logic
   - Error handling

---

### 5.3 Shared Data Module

**Purpose**: Shared data models and DTOs

**Package Structure:**
```
shared/data/
├── src/main/kotlin/
│   ├── dto/
│   │   ├── ProductDto.kt
│   │   ├── UserDto.kt
│   │   ├── OrderDto.kt
│   │   └── CategoryDto.kt
│   ├── mapper/
│   │   ├── BaseMapper.kt
│   │   └── MapperExtensions.kt
│   └── response/
│       ├── ApiResponse.kt
│       └── FirebaseResponse.kt
```

**Components:**

1. **Data Transfer Objects (DTOs)**
   - Firestore document representations
   - API response models
   - Network models

2. **Mappers**
   - Map DTOs to domain models
   - Map domain models to DTOs
   - Base mapper interface

3. **Response Wrappers**
   - Wrap Firebase responses
   - Handle errors
   - Standardize responses

---

## 6. Navigation Architecture

### 6.1 Navigation Component

**Using Android Navigation Component:**

**Navigation Graph Structure:**
```
app/
├── res/
│   └── navigation/
│       ├── nav_main.xml                     # Main navigation graph
│       ├── nav_auth.xml                     # Auth flow (nested)
│       ├── nav_home.xml                     # Home tab (nested)
│       ├── nav_products.xml                 # Products flow (nested)
│       ├── nav_cart.xml                     # Cart & checkout (nested)
│       └── nav_profile.xml                  # Profile tab (nested)
```

**Main Navigation Graph:**
- Auth flow (login, signup, onboarding)
- Main app (bottom navigation with tabs)
  - Home tab
  - Categories tab
  - Cart tab
  - Profile tab

**Navigation Flow:**

```
App Start
    ↓
Check if user logged in?
    ↓ No              ↓ Yes
Onboarding      Main Activity
    ↓                 ↓
Login/SignUp    Bottom Navigation
    ↓                 ↓
Main Activity   [Home | Categories | Cart | Profile]
```

### 6.2 Deep Linking

**Deep Link Structure:**
```
https://app.ecommerce.com/

/products/{productId}           → Product detail
/products?category={id}         → Category products
/search?q={query}               → Search results
/orders/{orderId}               → Order detail
/cart                           → Cart screen
/profile                        → Profile screen
/notifications                  → Notifications
```

**Firebase Dynamic Links:**
- Create shareable product links
- Track link clicks
- Handle app install attribution
- Fallback to web if app not installed

### 6.3 Bottom Navigation

**Tabs:**
1. Home - Home feed
2. Categories - Browse categories
3. Cart - Shopping cart (with badge)
4. Profile - User profile

**Navigation Logic:**
- Preserve back stack per tab
- Badge on cart icon (item count)
- Badge on notifications

---

## 7. Dependency Graph

### 7.1 Module Dependencies

```
                        app
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                 ↓
   feature modules   core modules    shared modules
        ↓                ↓                 ↓
   ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
   │         │      │         │      │         │
   auth    home  network  database   ui    domain
   products cart    ↑         ↑       ↑         ↑
   orders   ...     │         │       │         │
   profile          └─────────┴───────┴─────────┘
```

**Dependency Rules:**
- App module depends on all feature modules
- Feature modules depend on core and shared
- Core modules can depend on each other
- Shared modules depend on core
- No circular dependencies

### 7.2 Dependency Injection (Hilt)

**Hilt Modules:**

```
@InstallIn(SingletonComponent::class)
- Core modules (Firebase, Database, Network)
- Singletons

@InstallIn(ActivityComponent::class)
- Activity-scoped dependencies

@InstallIn(ViewModelComponent::class)
- ViewModels
- Repositories
- Use Cases
```

**Hilt Setup:**
- Application class annotated with `@HiltAndroidApp`
- Activities annotated with `@AndroidEntryPoint`
- Fragments annotated with `@AndroidEntryPoint`
- ViewModels annotated with `@HiltViewModel`

---

## 8. Firebase Integration Strategy

### 8.1 Firebase Initialization

**Application Class:**
```
Initialize Firebase on app start
Configure Crashlytics
Configure Analytics
Configure Performance Monitoring
Configure Remote Config
Set up offline persistence for Firestore
```

### 8.2 Firebase Services Usage by Module

**Authentication Module:**
- Firebase Authentication

**All Feature Modules:**
- Firestore for data
- Firebase Storage for images
- Firebase Analytics for tracking
- Crashlytics for errors

**Checkout Module:**
- Cloud Functions for order processing
- Cloud Functions for payment processing

**Notifications Module:**
- Firebase Cloud Messaging

**Home Module:**
- Remote Config for feature flags

### 8.3 Offline Support Strategy

**Firestore Offline Persistence:**
- Enable persistence for all collections
- Cache size limit: 100 MB
- Cache recent products, categories
- Cache user's cart, wishlist, orders

**Sync Strategy:**
- Write operations queued when offline
- Sync automatically when online
- Show sync status in UI
- Handle conflicts (last-write-wins)

**What Works Offline:**
- Browse cached products
- View cached orders
- View cart (from local)
- View profile
- Add to cart (syncs later)

**What Requires Online:**
- Login/Signup
- Search
- Place order
- Make payment
- Upload images
- Real-time updates

---

## 9. State Management

### 9.1 State Flow Pattern

**UI State:**
```kotlin
sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}
```

**ViewModel Example:**
```
ViewModel holds StateFlow<UiState>
UI observes StateFlow
On state change, UI reacts:
  - Loading: Show spinner
  - Success: Display data
  - Error: Show error message
  - Idle: Initial state
```

### 9.2 Event Handling

**One-Time Events:**
```kotlin
sealed class UiEvent {
    data class ShowToast(val message: String) : UiEvent()
    object NavigateToHome : UiEvent()
    data class ShowError(val error: String) : UiEvent()
}
```

**Event Flow:**
```
ViewModel emits events via SharedFlow
UI collects events
Process event once (navigation, toasts, etc.)
```

### 9.3 State Management Per Module

**Each Module:**
- ViewModel holds UI state
- State classes defined per screen
- Events for one-time actions
- Repository returns Flow/Result
- Use Cases transform data

---

## 10. Error Handling

### 10.1 Error Types

**Network Errors:**
- No internet connection
- Timeout
- Server error (Firebase)

**Business Logic Errors:**
- Validation errors
- Out of stock
- Invalid coupon
- Order cannot be cancelled

**Auth Errors:**
- Invalid credentials
- Email already exists
- Session expired

### 10.2 Error Handling Strategy

**Repository Layer:**
- Catch exceptions
- Map to domain errors
- Return Result.Error

**ViewModel Layer:**
- Handle Result
- Update UI state
- Emit error events

**UI Layer:**
- Display error messages
- Retry buttons
- Graceful degradation

**Firebase Error Mapping:**
```
FirebaseAuthException → Friendly message
FirebaseFirestoreException → Friendly message
FirebaseStorageException → Friendly message
```

---

## 11. Testing Strategy by Module

### 11.1 Unit Tests

**Test Each Layer:**

**Domain Layer:**
- Use cases logic
- Business rules
- Data transformations

**ViewModel:**
- State changes
- Event emissions
- Use case interactions (mocked)

**Repository:**
- Data fetching logic
- Caching logic
- Error handling

### 11.2 Integration Tests

**Repository + Data Source:**
- Test with Firebase Emulator
- Test caching behavior
- Test offline scenarios

**Navigation:**
- Test navigation flows
- Test deep links

### 11.3 UI Tests

**Espresso Tests:**
- Login flow
- Add to cart flow
- Checkout flow
- Navigation between screens

**Firebase Test Lab:**
- Run on real devices
- Multiple screen sizes
- Different Android versions

---

## 12. Build Configuration

### 12.1 Build Variants

**Debug Build:**
- Firebase Emulator
- Verbose logging
- Debug Firebase project
- ProGuard disabled
- Debuggable

**Staging Build:**
- Staging Firebase project
- Limited logging
- ProGuard enabled
- Not debuggable
- Test payment gateway

**Release Build:**
- Production Firebase project
- No logging
- ProGuard enabled
- Signed APK
- Real payment gateway

### 12.2 Gradle Configuration

**App-level build.gradle:**
- Define build types
- Configure product flavors
- Set version code/name
- Configure signing
- Add feature module dependencies

**Feature Module build.gradle:**
- Android library plugin
- Core and shared dependencies
- Hilt plugin

**buildSrc:**
- Centralized dependency versions
- Build configurations
- Custom Gradle tasks

---

## 13. Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- Set up project structure
- Configure multi-module architecture
- Set up Firebase project
- Implement core modules
- Set up dependency injection

### Phase 2: Authentication (Week 3)
- Implement auth module
- Login/Signup flows
- Firebase Auth integration
- Onboarding screens

### Phase 3: Core Features (Weeks 4-6)
- Home module
- Products module
- Search module
- Cart module

### Phase 4: Checkout & Orders (Weeks 7-8)
- Checkout flow
- Payment integration
- Orders module
- Order tracking

### Phase 5: Profile & Extras (Weeks 9-10)
- Profile module
- Wishlist module
- Reviews module
- Notifications module
- Support module

### Phase 6: Testing & Polish (Weeks 11-12)
- Integration testing
- UI testing
- Bug fixes
- Performance optimization
- Final polish

---

## 14. Key Decisions Checklist

Before starting development, decide on:

- [ ] UI Framework (XML Views vs Jetpack Compose)
- [ ] Image loading library (Coil vs Glide)
- [ ] Navigation library version
- [ ] Payment gateway provider
- [ ] Search solution (Firestore vs Algolia)
- [ ] Chat solution (Firestore vs third-party)
- [ ] Analytics beyond Firebase (Mixpanel, Amplitude?)
- [ ] Minimum SDK version
- [ ] Target markets and languages
- [ ] Offline functionality scope
- [ ] Push notification strategy
- [ ] App update strategy (force update?)
- [ ] Feature flags approach (Remote Config?)
- [ ] A/B testing requirements

---

## 15. Documentation Requirements

**For Each Module:**
- README.md with module purpose
- Architecture diagram
- API/Firestore usage
- Key components list
- Testing approach

**Root Documentation:**
- Project README
- Setup instructions
- Build instructions
- Firebase configuration guide
- Deployment guide
- Troubleshooting guide

---

## Document Metadata

**Version**: 1.0  
**Last Updated**: December 17, 2025  
**Author**: Development Team  
**Status**: Planning Phase

**Next Steps:**
1. Review and approve this architecture
2. Set up project structure
3. Create initial modules
4. Begin Phase 1 implementation

---

**End of Document**




