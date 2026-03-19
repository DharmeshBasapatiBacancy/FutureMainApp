# E‑commerce Requirements Gathering (Firebase Backend)

Questions and explanations to collect before building an e‑commerce app on Firebase. Wording is non‑technical so business and ops stakeholders can participate. Organized primarily by user type, then by internal teams, with a Firebase checklist.

## How to use
- Use each bullet as a conversation prompt; write down the decision and why.
- Ask for examples and edge cases (sales, returns, outages, fraud attempts).
- Mark what must work even if the internet is slow or briefly offline.

## Visitors / Guests (not signed in)
- Identity: Can people browse without logging in? If guest checkout is allowed, what minimum info do we ask (email, phone) and when?
- Catalog access: Are any products hidden by region/age? Should visitors still see relevant items or recommendations without an account?
- Finding products: What filters matter most (category, brand, price, color, rating, availability)? Should search fix typos and suggest autocomplete?
- Prices shown: Do visitors see regular price, discounts, tax estimates, and shipping estimates before giving an address?
- Cart behavior: Should a guest cart stay if they close the site or switch devices? How long before it expires? Any limit on items?
- Checkout steps: At what point do we require sign‑up or login? What addresses and contact details must we collect for a guest order?
- Content experience: Which pages are needed (home, landing, banners, FAQs)? Should text, currency, and units change by country/language? Any performance goals (e.g., fast load on mobile)?
- Consent and eligibility: Do we need cookie or analytics consent popups? Any age gates or restricted categories (e.g., alcohol)?

## Registered Customers (signed in)
- Sign‑up and login: Which options do we support (email/password, Google/Apple/Facebook)? Do we need two‑factor authentication? How do users recover accounts?
- Profile info: What is required (name, phone, addresses)? Can they save multiple addresses and preferred defaults? Saved payment methods are stored by the payment provider, not in our database.
- Shopping experience: Should customers see personalized suggestions, recently viewed items, and wishlists? Can they share wishlists?
- Cart and checkout: Should the cart stay in sync across phone, tablet, and desktop? How do promo codes, gift cards, and store credit work? Can customers choose delivery speed, pickup, or add delivery notes?
- Payments: Which methods are accepted (cards, wallets, buy now pay later, cash on delivery)? How do we handle extra verification like 3‑D Secure? What happens if a payment is declined—retry, switch method, or hold the order?
- Orders: What statuses do we use (created, paid, packed, shipped, delivered, canceled, returned)? Are backorders or preorders allowed? Any rules for substitutions or delivery time windows?
- Returns and refunds: Which products are returnable and for how long? Can customers return part of an order? Do we allow exchanges instead of refunds? Any fees or restocking rules?
- Notifications: Which events trigger messages (order placed, shipped, delivered, delayed)? Which channels are used (email, SMS, push, in‑app)? Can customers turn marketing on/off separately from transactional messages?
- Loyalty and referrals: How do points accrue and expire? Are there membership tiers? How do referral codes work and what are the limits?
- Support: Should customers contact support from inside the app/site? Can they attach order details and photos? How are disputes escalated?

## Sellers / Vendors (if marketplace)
- Onboarding: How do vendors sign up and get verified (documents, KYC)? Who approves them?
- Catalog control: Can vendors create/edit their own products? Are there templates or required attributes? Is there a review/approval step by admins?
- Inventory and pricing: Do vendors manage their own stock and prices? Are there rules for minimum/maximum prices or discounts?
- Orders and fulfillment: Who ships—vendor or platform? How do vendors get notified of new orders? Do they need SLAs for shipping and delivery?
- Payments and payouts: How are vendor earnings calculated (commissions, fees)? Payout schedule and minimum thresholds? How are disputes/chargebacks handled and deducted?
- Performance: What metrics are shown to vendors (sales, returns, cancellation rate)? Are there penalties for late shipping or poor quality?
- Support and compliance: How do vendors communicate with support? Any restricted categories or policy training required?

## Admin / Operations (internal teams)
- Catalog management: How are products structured (variants like size/color)? Who can add or edit items? Do we need drafts, scheduled launches, and an approval step? Do we keep an edit history?
- Inventory: Where is stock truth managed (ERP vs. our system)? Do we track stock by location or warehouse? Do we reserve items in the cart or only after payment? How do we prevent overselling?
- Pricing and promotions: What kinds of discounts are needed (percentage, fixed, bundles, BOGO)? Can discounts stack? Any exclusions by product, customer segment, or date/time? How are taxes applied in each region?
- Order operations: What is the pick/pack/ship process? Which shipping carriers are used? Do we need to print labels and store tracking links? How do we handle delivery exceptions or required signatures?
- Fraud and risk: What signals should we capture (IP, device info, velocity of orders)? When do we hold an order for manual review? Do we maintain blocklists/allowlists?
- Content and merchandising: Who controls homepage, category pages, and banners? Do we run A/B tests or targeted content by segment or region?
- Access control: Which roles exist (admin, merchandiser, support agent)? Which actions require approval (price changes, refunds)?
- Audit trail: What changes must be recorded (who edited products, prices, inventory, or orders, and when)?

## Customer Support (agents)
- Agent workspace: How should agents search (by order number, user, email, phone)? Which quick filters matter (status, late delivery)?
- Actions allowed: Can agents create, modify, or cancel orders? Under what rules? Can they issue refunds, credits, or resend confirmations? Can they edit addresses before shipment?
- Communication: Should every interaction be logged? Do agents use message templates? Can they attach images or documents? Should outbound emails/SMS include order context automatically?
- Policy guardrails: What are the rules for returns, exchanges, goodwill credits, and when is supervisor approval needed?

## Marketing / Growth
- Acquisition: How do we track campaigns (UTM links, referral codes)? Do we need custom landing pages?
- Engagement: What does the welcome/onboarding journey look like? What is the cadence for email/push? What triggers win‑back or abandoned cart/browse messages?
- Segmentation: Which attributes define audiences (behavior, geography, purchase history)? Do we need real‑time segments or is daily batch enough? Where do we export audiences (ads platforms, email tools, BigQuery)?
- Experiments: How do we run A/B tests or feature flags? What success metrics matter, and what guardrails prevent bad variants from hurting revenue?

## Finance / Accounting
- Payments and settlement: Which payment providers are used? How often do payouts arrive and how are fees handled? Do we charge in multiple currencies or only display them?
- Tax/VAT/GST: Who calculates tax (built‑in rules or third‑party)? Do we need to collect tax IDs and show them on invoices?
- Refunds and chargebacks: What evidence do we keep for disputes? Who assembles and submits it? How long do we retain records?
- Reporting: How do we recognize revenue? How are gift cards and store credit tracked as liabilities? What level of detail is required for ledgers and exports?

## Delivery / Logistics Partners (if used)
- Carrier setup: Which carriers or couriers are supported? Do we need rate comparison or scheduled pickups?
- Tracking: How do we ingest tracking updates (push/webhook vs. polling)? How do we translate carrier statuses into customer‑friendly messages?
- Proof of delivery: Do we require photos, signatures, or location confirmation?

## System‑Level & Non‑Functional (applies to everyone)
- Performance and uptime: What page load and response time targets do we need? What availability is expected?
- Traffic spikes: Do we plan for flash sales or campaigns? Should we queue or throttle to protect the system?
- Limited connectivity: Which parts should still work if the connection is poor (e.g., browsing cached catalog, keeping the cart)? How do we resolve conflicts when the app comes back online?
- Data handling: Any rules about where data must live (country/region)? What data should be minimized or deleted after a period? How do users request deletion?
- Compliance and safety: Do we handle payments without storing raw card numbers (PCI scope)? Do we meet privacy laws like GDPR/CCPA? Are accessibility standards (e.g., WCAG) required? Do we need defenses like content security policies or rate limits?
- Monitoring and alerts: What do we log and measure? Who gets alerted for errors or slowdowns? What are acceptable error budgets?
- Backups and change management: How often are backups taken and how fast must we restore? How do we roll out changes safely and roll back if needed?

## Firebase‑Specific Checklist
- Authentication: Which sign‑in providers are enabled? Do we enforce MFA? Do we need roles/permissions stored as custom claims? How long should sessions last? Should any sign‑ins be blocked for risk reasons?
- Firestore data model: Which collections do we need (products, variants, carts, orders)? How do we keep documents small and avoid hotspots on heavy‑write areas like carts/orders? Do we use subcollections or top‑level collections for clarity?
- Security Rules: How do roles and claims control reads/writes? Which fields are protected from user edits (prices, totals)? Should reads be filtered by customer segment or region?
- Cloud Functions: Which actions must run on the server for trust (pricing, payment intents, refunds, inventory reservations, promo validation)? Which region minimizes latency and cold starts?
- Integrations: Which payment service provider and how to handle webhooks? Which search/index service (e.g., Algolia/Elastic)? How do we export analytics to BigQuery? Which email/SMS and shipping providers are used?
- Storage and media: How do we store and serve images/files (Cloud Storage + CDN)? Do we need signed URLs or on‑the‑fly image resizing?
- Real‑time updates: Which experiences must update live (order status, inventory signals, chat)? Should we use Firestore listeners, Realtime Database, or Pub/Sub?
- Cost control: What are expected read/write volumes? Where will we cache (Cloud CDN/edge)? Can we archive or expire old data to control costs?
- Environments and testing: Do we keep separate Firebase projects for dev/stage/prod? Which emulators are required for local testing (Auth, Firestore, Functions)? How do we manage feature flags per environment?
- Deployment and access: How are Functions and Rules deployed (CI/CD)? How do we roll back quickly? Who can deploy, and do we follow least‑privilege access?

