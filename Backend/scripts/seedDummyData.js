require('dotenv').config();
const { supabase } = require('../config/supabase');

// Sample data generators
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Amanda', 'Daniel', 'Melissa', 'Matthew', 'Michelle', 'Christopher', 'Kimberly', 'Andrew', 'Nicole'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
const businessNames = ['Tech Solutions Inc', 'Global Commerce Co', 'Digital Marketplace', 'Premium Goods Ltd', 'Smart Retail', 'Elite Trading', 'Modern Supply Chain', 'Quality Products Co', 'Innovation Hub', 'Best Buy Wholesale'];
const productNames = [
  'Wireless Bluetooth Headphones', 'Smartphone Case', 'Laptop Stand', 'USB-C Cable', 'Wireless Mouse',
  'Mechanical Keyboard', 'Monitor Stand', 'Webcam HD', 'External Hard Drive', 'Power Bank 20000mAh',
  'Desk Organizer', 'Cable Management', 'Laptop Sleeve', 'Tablet Stand', 'Phone Mount',
  'Bluetooth Speaker', 'Wireless Charger', 'HDMI Cable', 'Ethernet Cable', 'USB Hub',
  'Coffee Maker', 'Water Bottle', 'Backpack', 'Running Shoes', 'Yoga Mat',
  'Dumbbells Set', 'Resistance Bands', 'Fitness Tracker', 'Protein Shaker', 'Gym Bag',
  'LED Desk Lamp', 'Desk Chair', 'Standing Desk', 'Monitor Arm', 'Keyboard Tray',
  'Mouse Pad', 'Headphone Stand', 'Cable Clips', 'Desk Mat', 'Foot Rest'
];
const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
  { name: 'Computers', slug: 'computers', description: 'Computer hardware and accessories', parent: 'Electronics' },
  { name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Smartphone and tablet accessories', parent: 'Electronics' },
  { name: 'Fitness', slug: 'fitness', description: 'Fitness and exercise equipment' },
  { name: 'Home & Office', slug: 'home-office', description: 'Home and office furniture and accessories' },
  { name: 'Audio', slug: 'audio', description: 'Audio equipment and accessories', parent: 'Electronics' },
  { name: 'Cables & Adapters', slug: 'cables-adapters', description: 'Cables and adapters', parent: 'Electronics' },
  { name: 'Furniture', slug: 'furniture', description: 'Furniture items', parent: 'Home & Office' },
];

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

// Helper function to generate random date
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate order number
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

async function seedDummyData() {
  console.log('🌱 Starting dummy data seeding...\n');

  try {
    // 1. Create Categories
    console.log('📁 Creating categories...');
    const categoryMap = {};
    const rootCategories = categories.filter(c => !c.parent);
    
    for (const cat of rootCategories) {
      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          status: 'active',
          display_order: categories.indexOf(cat),
        })
        .select()
        .single();
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating category ${cat.name}:`, error.message);
      } else if (category) {
        categoryMap[cat.name] = category.id;
        console.log(`  ✓ Created category: ${cat.name}`);
      }
    }

    // Create subcategories
    const subCategories = categories.filter(c => c.parent);
    for (const cat of subCategories) {
      const parentId = categoryMap[cat.parent];
      if (parentId) {
        const { data: category, error } = await supabase
          .from('categories')
          .insert({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            parent_id: parentId,
            status: 'active',
            display_order: categories.indexOf(cat),
          })
          .select()
          .single();
        
        if (error && !error.message.includes('duplicate')) {
          console.error(`Error creating subcategory ${cat.name}:`, error.message);
        } else if (category) {
          categoryMap[cat.name] = category.id;
          console.log(`  ✓ Created subcategory: ${cat.name}`);
        }
      }
    }

    // Get all category IDs
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id');
    const categoryIds = allCategories?.map(c => c.id) || [];

    // 2. Create Customers (25 customers)
    console.log('\n👥 Creating customers...');
    const customerIds = [];
    for (let i = 0; i < 25; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `customer${i + 1}@example.com`;
      const password = 'Customer123!';

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError && !authError.message.includes('already registered')) {
          console.error(`Error creating customer ${email}:`, authError.message);
          continue;
        }

        if (authData?.user) {
          // Create user record
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              display_name: `${firstName} ${lastName}`,
              role: 'customer',
              account_status: Math.random() > 0.1 ? 'active' : 'suspended',
              email_verified: true,
              is_guest: false,
            });

          if (!userError) {
            customerIds.push(authData.user.id);
            console.log(`  ✓ Created customer: ${email}`);
          }
        }
      } catch (error) {
        console.error(`Error creating customer ${i + 1}:`, error.message);
      }
    }

    // 3. Create Vendors (8 vendors)
    console.log('\n🏪 Creating vendors...');
    const vendorIds = [];
    for (let i = 0; i < 8; i++) {
      const businessName = businessNames[i] || `Business ${i + 1}`;
      const email = `vendor${i + 1}@example.com`;
      const password = 'Vendor123!';
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError && !authError.message.includes('already registered')) {
          console.error(`Error creating vendor ${email}:`, authError.message);
          continue;
        }

        if (authData?.user) {
          // Create user record
          await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              display_name: `${firstName} ${lastName}`,
              role: 'vendor',
              account_status: 'active',
              email_verified: true,
            });

          // Create vendor record
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert({
              id: authData.user.id,
              business_name: businessName,
              business_email: email,
              business_phone: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              status: Math.random() > 0.2 ? 'active' : 'pending_approval',
              verified: Math.random() > 0.3,
              commission_rate: 10 + Math.random() * 5, // 10-15%
              rating: 3.5 + Math.random() * 1.5, // 3.5-5.0
              total_sales: Math.random() * 50000,
            });

          if (!vendorError) {
            vendorIds.push(authData.user.id);
            console.log(`  ✓ Created vendor: ${businessName}`);
          }
        }
      } catch (error) {
        console.error(`Error creating vendor ${i + 1}:`, error.message);
      }
    }

    // 4. Create Products (80 products)
    console.log('\n📦 Creating products...');
    const productIds = [];
    for (let i = 0; i < 80; i++) {
      const productName = productNames[i % productNames.length] + (i > productNames.length ? ` ${Math.floor(i / productNames.length) + 1}` : '');
      const vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];
      const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
      const price = Math.round((10 + Math.random() * 200) * 100) / 100;
      const stock = Math.floor(Math.random() * 500);
      const sku = `SKU-${Date.now()}-${i}`;
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${i}`;

      try {
        const { data: product, error } = await supabase
          .from('products')
          .insert({
            name: productName,
            sku,
            slug,
            description: `High-quality ${productName.toLowerCase()} with excellent features and durability.`,
            short_description: `Premium ${productName.toLowerCase()}.`,
            price,
            stock,
            status: Math.random() > 0.2 ? 'published' : 'draft',
            category_id: categoryId,
            vendor_id: vendorId,
            primary_image_url: `https://picsum.photos/400/400?random=${i}`,
            images: [
              `https://picsum.photos/400/400?random=${i}`,
              `https://picsum.photos/400/400?random=${i + 1000}`,
            ],
            featured: Math.random() > 0.7,
            trending: Math.random() > 0.8,
            new_arrival: Math.random() > 0.7,
            best_seller: Math.random() > 0.9,
            pricing: {
              basePrice: price,
              salePrice: Math.random() > 0.5 ? Math.round((price * 0.8) * 100) / 100 : null,
              costPrice: Math.round((price * 0.5) * 100) / 100,
            },
            inventory: {
              stockQuantity: stock,
              lowStockThreshold: 10,
              stockStatus: stock > 10 ? 'in_stock' : stock > 0 ? 'low_stock' : 'out_of_stock',
            },
            ratings: {
              averageRating: 3.5 + Math.random() * 1.5,
              totalReviews: Math.floor(Math.random() * 200),
            },
          })
          .select()
          .single();

        if (!error && product) {
          productIds.push(product.id);
          if ((i + 1) % 10 === 0) {
            console.log(`  ✓ Created ${i + 1} products...`);
          }
        }
      } catch (error) {
        console.error(`Error creating product ${i + 1}:`, error.message);
      }
    }
    console.log(`  ✓ Created ${productIds.length} products`);

    // 5. Create Orders (40 orders)
    console.log('\n🛒 Creating orders...');
    for (let i = 0; i < 40; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemPrice = Math.round((10 + Math.random() * 100) * 100) / 100;
        const itemTotal = itemPrice * quantity;
        subtotal += itemTotal;

        items.push({
          product_id: productId,
          name: productNames[Math.floor(Math.random() * productNames.length)],
          quantity,
          price: itemPrice,
          total: itemTotal,
        });
      }

      const shippingCost = Math.round((5 + Math.random() * 15) * 100) / 100;
      const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
      const discountAmount = Math.random() > 0.7 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
      const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const createdAt = randomDate(new Date(2024, 0, 1), new Date());

      try {
        const { error } = await supabase
          .from('orders')
          .insert({
            order_number: generateOrderNumber(),
            user_id: customerId,
            status,
            payment_status: paymentStatus,
            total_amount: totalAmount,
            subtotal,
            shipping_cost: shippingCost,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            items,
            shipping_address: {
              street: `${Math.floor(Math.random() * 9999)} Main St`,
              city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
              state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
              zip: Math.floor(Math.random() * 90000) + 10000,
              country: 'USA',
            },
            billing_address: {
              street: `${Math.floor(Math.random() * 9999)} Main St`,
              city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
              state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
              zip: Math.floor(Math.random() * 90000) + 10000,
              country: 'USA',
            },
            payment_method: ['credit_card', 'debit_card', 'paypal', 'stripe'][Math.floor(Math.random() * 4)],
            shipping_method: ['standard', 'express', 'overnight'][Math.floor(Math.random() * 3)],
            tracking_number: status === 'shipped' || status === 'delivered' ? `TRACK-${Date.now()}-${i}` : null,
            status_history: [
              {
                status: 'pending',
                updated_at: createdAt.toISOString(),
              },
              ...(status !== 'pending' ? [{
                status,
                updated_at: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              }] : []),
            ],
            created_at: createdAt.toISOString(),
          });

        if (!error && (i + 1) % 10 === 0) {
          console.log(`  ✓ Created ${i + 1} orders...`);
        }
      } catch (error) {
        console.error(`Error creating order ${i + 1}:`, error.message);
      }
    }
    console.log(`  ✓ Created 40 orders`);

    console.log('\n✅ Dummy data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categoryIds.length}`);
    console.log(`   - Customers: ${customerIds.length}`);
    console.log(`   - Vendors: ${vendorIds.length}`);
    console.log(`   - Products: ${productIds.length}`);
    console.log(`   - Orders: 40`);
    console.log('\n🎉 You can now test the admin panel with this data!\n');

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    process.exit(1);
  }
}

// Run the script
seedDummyData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

