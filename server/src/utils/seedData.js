import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bizmind_ai';

const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    console.error('[Seed] Refusing to run: this script DELETES ALL DATA and NODE_ENV=production.');
    console.error('[Seed] Set ALLOW_SEED=true only if you are 100% sure the target database is disposable.');
    process.exit(1);
  }
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    // Clean existing seed collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Business.deleteMany({}),
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Invoice.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo business & owner...');

    // 1. Create Owner User (Company Branded)
    const owner = new User({
      name: 'Alexander Wright',
      email: 'owner@aurahome.com',
      password: 'Password123!',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    await owner.save();

    // 2. Create Business Workspace
    const business = await Business.create({
      name: 'Aura Home & Living',
      type: 'E-commerce & Retail',
      industry: 'Smart Home & Interior Design',
      country: 'United States',
      currency: 'USD',
      size: '10-25 employees',
      ownerId: owner._id,
      email: 'contact@aurahome.com',
      phone: '+1 (555) 382-9100',
      address: '742 Evergreen Terrace, Suite 400, Austin, TX 78701',
      taxNumber: 'US-TAX-89214710',
    });

    owner.businessId = business._id;
    await owner.save();

    // 3. Create Manager & Staff Users (Company Branded)
    const manager = new User({
      name: 'Sophia Patel',
      email: 'manager@aurahome.com',
      password: 'Password123!',
      role: 'manager',
      businessId: business._id,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });
    await manager.save();

    const staff = new User({
      name: 'Marcus Vance',
      email: 'staff@aurahome.com',
      password: 'Password123!',
      role: 'staff',
      businessId: business._id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });
    await staff.save();

    // Also support @bizmind.ai accounts for backwards compatibility
    const legacyOwner = new User({
      name: 'Alexander Wright (BizMind)',
      email: 'owner@bizmind.ai',
      password: 'Password123!',
      role: 'owner',
      businessId: business._id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    await legacyOwner.save();

    const legacyManager = new User({
      name: 'Sophia Patel (BizMind)',
      email: 'manager@bizmind.ai',
      password: 'Password123!',
      role: 'manager',
      businessId: business._id,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });
    await legacyManager.save();

    const legacyStaff = new User({
      name: 'Marcus Vance (BizMind)',
      email: 'staff@bizmind.ai',
      password: 'Password123!',
      role: 'staff',
      businessId: business._id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });
    await legacyStaff.save();

    console.log('[Seed] Users created: owner/manager/staff for both @aurahome.com and @bizmind.ai');

    // 3b. Create Platform Super Admin
    const superAdmin = new User({
      name: 'Platform Super Admin',
      email: 'abdullahanis592@gmail.com',
      password: 'Password123!',
      role: 'superadmin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    });
    await superAdmin.save();
    console.log('[Seed] Super Admin user created: abdullahanis592@gmail.com (role: superadmin)');

    // 4. Create 22 Realistic Customers
    const customerRawData = [
      { name: 'Elena Rostova', email: 'elena.rostova@nexusgroup.com', phone: '+1 512 839 1022', company: 'Nexus Design Group', address: { street: '1401 Congress Ave', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' }, status: 'active', notes: 'Key enterprise interior design partner.' },
      { name: 'David Chen', email: 'dchen@meridiantech.io', phone: '+1 415 671 9021', company: 'Meridian Tech Labs', address: { street: '500 Howard St', city: 'San Francisco', state: 'CA', zip: '94105', country: 'USA' }, status: 'active', notes: 'Frequent buyer of modern smart office decor.' },
      { name: 'Sarah Jenkins', email: 'sarah.j@jenkinsarchitects.com', phone: '+1 206 443 1899', company: 'Jenkins Architecture', address: { street: '820 4th Ave', city: 'Seattle', state: 'WA', zip: '98104', country: 'USA' }, status: 'active', notes: 'B2B studio furnishing contract.' },
      { name: 'Michael Rodriguez', email: 'mrodriguez@vanguardco.org', phone: '+1 305 782 4511', company: 'Vanguard Hospitality', address: { street: '1111 Brickell Ave', city: 'Miami', state: 'FL', zip: '33131', country: 'USA' }, status: 'active', notes: 'Luxury hotel lounge furnishing.' },
      { name: 'Amara Okafor', email: 'amara@okaforstudio.design', phone: '+1 312 902 3344', company: 'Okafor Design Studio', address: { street: '220 N Green St', city: 'Chicago', state: 'IL', zip: '60607', country: 'USA' }, status: 'active', notes: 'Modern minimalist design specialist.' },
      { name: 'Liam O’Connor', email: 'liam@dublincapital.com', phone: '+1 617 330 9200', company: 'Dublin Capital', address: { street: '100 Federal St', city: 'Boston', state: 'MA', zip: '02110', country: 'USA' }, status: 'active', notes: 'Executive boardroom revamp.' },
      { name: 'Chloe Dubois', email: 'chloe.dubois@atelierlumiere.com', phone: '+1 212 984 6610', company: 'Atelier Lumiere', address: { street: '450 W 33rd St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' }, status: 'active', notes: 'Lighting & ambiance consultant.' },
      { name: 'James Wilson', email: 'jwilson@denverproperties.co', phone: '+1 303 552 1199', company: 'Highland Property Group', address: { street: '1700 Lincoln St', city: 'Denver', state: 'CO', zip: '80203', country: 'USA' }, status: 'active', notes: 'Furnishes staged residential properties.' },
      { name: 'Hannah Schmidt', email: 'hannah.s@bavaria-import.de', phone: '+49 89 2444 8900', company: 'Bavaria Decor Imports', address: { street: 'Maximilianstr 32', city: 'Munich', state: 'BY', zip: '80539', country: 'Germany' }, status: 'active', notes: 'European luxury retail distributor.' },
      { name: 'Lucas Silva', email: 'lucas.silva@riointeriors.br', phone: '+55 21 3490 8821', company: 'Rio Modern Interiors', address: { street: 'Av Atlantica 1020', city: 'Rio de Janeiro', state: 'RJ', zip: '22010', country: 'Brazil' }, status: 'lead', notes: 'Requested bulk catalog pricing for resorts.' },
      { name: 'Jessica Taylor', email: 'jtaylor@taylorlegal.com', phone: '+1 404 881 2300', company: 'Taylor & Associates Law', address: { street: '1180 Peachtree St', city: 'Atlanta', state: 'GA', zip: '30309', country: 'USA' }, status: 'active', notes: 'Furnished private legal offices.' },
      { name: 'Vikram Malhotra', email: 'vikram@malhotratech.in', phone: '+91 22 6789 1100', company: 'Malhotra Ventures', address: { street: 'Bandra Kurla Complex', city: 'Mumbai', state: 'MH', zip: '400051', country: 'India' }, status: 'active', notes: 'Smart home ecosystem enthusiast.' },
      { name: 'Emily Watson', email: 'emily@creativelabs.io', phone: '+1 503 224 8830', company: 'Creative Labs Portland', address: { street: '1120 NW Couch St', city: 'Portland', state: 'OR', zip: '97209', country: 'USA' }, status: 'active', notes: 'Sustainable home decor preference.' },
      { name: 'Tariq Al-Mansoor', email: 'tariq@gulfrealty.ae', phone: '+971 4 399 2200', company: 'Gulf Luxury Estates', address: { street: 'Sheikh Zayed Rd', city: 'Dubai', state: 'DXB', zip: '00000', country: 'UAE' }, status: 'active', notes: 'Penthouse decor collections.' },
      { name: 'Rachel Green', email: 'rachel@greenlivingboutique.com', phone: '+1 615 292 7800', company: 'Green Living Boutique', address: { street: '2100 21st Ave S', city: 'Nashville', state: 'TN', zip: '37212', country: 'USA' }, status: 'active', notes: 'Wholesale retail purchaser.' },
      { name: 'Kenji Takahashi', email: 'kenji@tokyodesignworks.jp', phone: '+81 3 5400 9988', company: 'Tokyo Design Works', address: { street: 'Roppongi Hills Mori Tower', city: 'Tokyo', state: 'TYO', zip: '106-6108', country: 'Japan' }, status: 'active', notes: 'Minimalist wood craft buyer.' },
      { name: 'Olivia Martin', email: 'omartin@solardesign.co', phone: '+1 602 443 1928', company: 'Solar Modern Living', address: { street: '201 E Washington St', city: 'Phoenix', state: 'AZ', zip: '85004', country: 'USA' }, status: 'lead', notes: 'Expressed interest in upcoming spring line.' },
      { name: 'Benjamin Scott', email: 'bscott@apexfinancial.com', phone: '+1 704 382 7000', company: 'Apex Financial Advisors', address: { street: '550 S Tryon St', city: 'Charlotte', state: 'NC', zip: '28202', country: 'USA' }, status: 'active', notes: 'Purchased lounge furnishings.' },
      { name: 'Nadia Petrova', email: 'nadia@nordicliving.se', phone: '+46 8 505 20000', company: 'Nordic Style Living', address: { street: 'Hamngatan 15', city: 'Stockholm', state: 'AB', zip: '111 47', country: 'Sweden' }, status: 'active', notes: 'Scandinavian aesthetic styling.' },
      { name: 'Gabriel Santos', email: 'gabriel@santoshome.pt', phone: '+351 21 340 9100', company: 'Santos Casa & Arte', address: { street: 'Avenida da Liberdade 180', city: 'Lisbon', state: 'LX', zip: '1250-146', country: 'Portugal' }, status: 'inactive', notes: 'Seasonal account.' },
      { name: 'Zoe Campbell', email: 'zoe@campbelldesign.ca', phone: '+1 416 977 4488', company: 'Campbell Interiors Toronto', address: { street: '161 Bay St', city: 'Toronto', state: 'ON', zip: 'M5J 2S1', country: 'Canada' }, status: 'active', notes: 'Bi-monthly recurring procurement.' },
      { name: 'Arthur Pendelton', email: 'arthur@pendeltonmanor.co.uk', phone: '+44 20 7946 0192', company: 'Pendelton Estate Furnishings', address: { street: '45 Berkeley Square', city: 'London', state: 'LDN', zip: 'W1J 5AS', country: 'UK' }, status: 'active', notes: 'Classic luxury accents.' },
    ];

    const customers = [];
    for (const c of customerRawData) {
      const created = await Customer.create({
        businessId: business._id,
        ...c,
        totalSpent: 0,
        ordersCount: 0,
      });
      customers.push(created);
    }
    console.log(`[Seed] ${customers.length} realistic customers created.`);

    // 5. Create 18 Realistic Products
    const productRawData = [
      { name: 'Aura Lumina Ambient Smart Lamp', sku: 'AL-SMP-001', category: 'Smart Lighting', description: 'App-controlled ambient light with circadian rhythm synchronization and solid brass base.', price: 189.00, cost: 68.00, stock: 45, lowStockThreshold: 10, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80' },
      { name: 'Nordic Oak Ergonomic Lounge Chair', sku: 'NO-CHR-002', category: 'Furniture', description: 'Sculptural solid white oak accent armchair with premium Italian boucle fabric.', price: 749.00, cost: 295.00, stock: 12, lowStockThreshold: 4, image: 'https://images.unsplash.com/photo-1580481077112-940a02cfc21e?w=400&auto=format&fit=crop&q=80' },
      { name: 'Ceramic Ultrasonic Aroma Diffuser', sku: 'CD-DIF-003', category: 'Home Wellness', description: 'Handcrafted matte ceramic wellness diffuser with warm LED underglow.', price: 95.00, cost: 28.00, stock: 85, lowStockThreshold: 15, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=80' },
      { name: 'Aura Horizon Floating Desk Shelf', sku: 'AH-DSK-004', category: 'Office & Studio', description: 'Solid walnut dual-monitor desk riser with integrated cable management channels.', price: 219.00, cost: 74.00, stock: 3, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&auto=format&fit=crop&q=80' }, // Low stock
      { name: 'Minimalist Matte Ceramic Planter Set', sku: 'MC-PLT-005', category: 'Home Decor', description: 'Set of 3 architectural drainage planters in textured chalk white and terracotta.', price: 110.00, cost: 35.00, stock: 60, lowStockThreshold: 12, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop&q=80' },
      { name: 'Aura Soundbar Walnut Acoustic Speaker', sku: 'AS-SPK-006', category: 'Audio & Tech', description: 'Hi-Fi Bluetooth 5.3 bookshelf speaker wrapped in acoustically transparent linen and walnut.', price: 349.00, cost: 135.00, stock: 24, lowStockThreshold: 6, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80' },
      { name: 'Woven Organic Linen Throw Blanket', sku: 'WL-BLK-007', category: 'Textiles', description: 'Oeko-Tex certified 100% Belgian flax linen throw with fringed edges in oatmeal.', price: 145.00, cost: 42.00, stock: 38, lowStockThreshold: 10, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&auto=format&fit=crop&q=80' },
      { name: 'Brushed Brass Architectural Pendant', sku: 'BA-LGT-008', category: 'Smart Lighting', description: 'Dimmable warm glow pendant fixture with mouth-blown frosted glass sphere.', price: 265.00, cost: 95.00, stock: 2, lowStockThreshold: 5, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&auto=format&fit=crop&q=80' }, // Low stock
      { name: 'Sculptural Marble Bookends (Pair)', sku: 'SM-BKE-009', category: 'Home Decor', description: 'Heavy natural Carrara marble geometric bookends with felt base protection.', price: 125.00, cost: 38.00, stock: 52, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80' },
      { name: 'Travertine Low Coffee Table', sku: 'TL-TBL-010', category: 'Furniture', description: 'Honed Roman travertine stone monolithic coffee table with rounded fluted edges.', price: 1190.00, cost: 480.00, stock: 7, lowStockThreshold: 3, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&auto=format&fit=crop&q=80' },
      { name: 'Aura Air Smart Hepa Purifier', sku: 'AA-AIR-011', category: 'Home Wellness', description: 'Whisper-quiet air purifier with real-time PM2.5 display and cedarwood filter cartridge.', price: 289.00, cost: 112.00, stock: 19, lowStockThreshold: 5, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop&q=80' },
      { name: 'Japanese Hand-Carved Hinoki Tray', sku: 'JH-TRY-012', category: 'Home Decor', description: 'Natural fragrant Hinoki cypress decorative serving and organizing tray.', price: 85.00, cost: 24.00, stock: 0, lowStockThreshold: 6, image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&auto=format&fit=crop&q=80' }, // Out of stock
      { name: 'Magnetic Wireless Charging Valet', sku: 'MW-CHG-013', category: 'Audio & Tech', description: 'Triple fast-charging station crafted from anodized space gray aluminum and saddle leather.', price: 165.00, cost: 58.00, stock: 32, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&auto=format&fit=crop&q=80' },
      { name: 'Smoked Glass Decanter & Tumbler Set', sku: 'SG-GLS-014', category: 'Home Decor', description: 'Hand-blown fluted smoked borosilicate glass decanter with four matching tumblers.', price: 140.00, cost: 40.00, stock: 40, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop&q=80' },
      { name: 'Artisan Wool Area Rug (8x10)', sku: 'AW-RUG-015', category: 'Textiles', description: 'Hand-knotted New Zealand wool rug featuring subtle asymmetrical geometric lines.', price: 890.00, cost: 360.00, stock: 5, lowStockThreshold: 2, image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&auto=format&fit=crop&q=80' },
      { name: 'Architectural Table Task Lamp', sku: 'AT-LMP-016', category: 'Smart Lighting', description: 'Balanced arm cantilever desk lamp in matte black steel with touch-sensitive dimming.', price: 195.00, cost: 65.00, stock: 28, lowStockThreshold: 6, image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=400&auto=format&fit=crop&q=80' },
      { name: 'Cashmere Ribbed Knit Throw Pillow', sku: 'CR-PLW-017', category: 'Textiles', description: 'Sumptuous feather-down filled cashmere pillow in warm sand tone.', price: 95.00, cost: 27.00, stock: 4, lowStockThreshold: 10, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&auto=format&fit=crop&q=80' }, // Low stock
      { name: 'Aura Studio Wireless Headphones', sku: 'AS-HDP-018', category: 'Audio & Tech', description: 'Active noise cancellation headphones with custom neodymium drivers and memory foam cups.', price: 320.00, cost: 120.00, stock: 22, lowStockThreshold: 5, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80' },
    ];

    const products = [];
    for (const p of productRawData) {
      const created = await Product.create({
        businessId: business._id,
        ...p,
      });
      products.push(created);
    }
    console.log(`[Seed] ${products.length} realistic products created.`);

    // 6. Generate 38 Realistic Orders Spread Across 6 Months
    console.log('[Seed] Generating realistic order timeline and invoices...');
    const now = new Date();
    const orderStatuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Processing', 'Pending', 'Cancelled'];
    const paymentStatuses = ['Paid', 'Paid', 'Paid', 'Paid', 'Partial', 'Unpaid'];

    const orders = [];
    const invoices = [];

    for (let i = 1; i <= 38; i++) {
      // Pick random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];

      // Select 1 to 4 distinct products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
      const selected = shuffledProducts.slice(0, numItems);

      const items = selected.map(prod => {
        const qty = Math.floor(Math.random() * 3) + 1;
        const total = Number((prod.price * qty).toFixed(2));
        return {
          productId: prod._id,
          name: prod.name,
          sku: prod.sku,
          price: prod.price,
          cost: prod.cost,
          quantity: qty,
          total,
        };
      });

      const subtotal = items.reduce((acc, item) => acc + item.total, 0);
      const discount = Math.random() > 0.6 ? Number((subtotal * 0.1).toFixed(2)) : 0;
      const taxable = subtotal - discount;
      const tax = Number((taxable * 0.0825).toFixed(2)); // 8.25% sales tax
      const grandTotal = Number((taxable + tax).toFixed(2));

      // Realistic date distributed over past 150 days
      const daysAgo = Math.floor(Math.random() * 150);
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      orderDate.setHours(Math.floor(Math.random() * 12) + 9, Math.floor(Math.random() * 60));

      const status = daysAgo > 30 ? 'Completed' : orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      let paymentStatus = status === 'Completed' ? 'Paid' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      if (status === 'Cancelled') {
        paymentStatus = 'Unpaid';
      }

      const orderNumber = `ORD-${String(i).padStart(4, '0')}`;

      const order = await Order.create({
        businessId: business._id,
        orderNumber,
        customerId: customer._id,
        items,
        subtotal,
        discount,
        tax,
        total: grandTotal,
        status,
        paymentStatus,
        notes: `Standard delivery via FedEx Freight. Delivery confirmation required.`,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
      orders.push(order);

      // Update customer aggregates
      customer.ordersCount += 1;
      if (paymentStatus === 'Paid') {
        customer.totalSpent += grandTotal;
      }
      await customer.save();

      // Generate invoice for 80% of orders
      if (i <= 32) {
        const invoiceNumber = `INV-${orderDate.getFullYear()}-${String(i).padStart(4, '0')}`;
        const dueDate = new Date(orderDate.getTime() + 14 * 24 * 60 * 60 * 1000);

        const invoice = await Invoice.create({
          businessId: business._id,
          invoiceNumber,
          orderId: order._id,
          customerId: customer._id,
          customerInfo: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            company: customer.company,
            address: `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`,
          },
          items: items.map(it => ({
            name: it.name,
            sku: it.sku,
            price: it.price,
            quantity: it.quantity,
            total: it.total,
          })),
          subtotal,
          discount,
          tax,
          total: grandTotal,
          paymentStatus,
          invoiceDate: orderDate,
          dueDate,
          notes: 'Standard 14-day net payment terms. Late payments subject to a 1.5% monthly charge.',
          createdAt: orderDate,
          updatedAt: orderDate,
        });
        invoices.push(invoice);
      }
    }

    console.log(`[Seed] ${orders.length} orders and ${invoices.length} invoices generated successfully.`);

    // 7. Create Realistic Notifications
    const notificationList = [
      {
        title: 'Critical Low Stock: Aura Horizon Floating Desk Shelf',
        message: 'Only 3 units remain in stock. Safety threshold is 8 units. Reorder recommended.',
        type: 'low_stock',
        link: '/products',
        read: false,
      },
      {
        title: 'Out of Stock: Japanese Hand-Carved Hinoki Tray',
        message: 'Stock has reached 0 units. Customer backorders are pending.',
        type: 'low_stock',
        link: '/products',
        read: false,
      },
      {
        title: 'New High-Value Order Received',
        message: 'Order #ORD-0038 for $1,342.50 was placed by Nexus Design Group.',
        type: 'new_order',
        link: '/orders',
        read: false,
      },
      {
        title: 'Payment Received: Invoice INV-2026-0028',
        message: 'Full payment of $842.15 received from Meridian Tech Labs.',
        type: 'payment_received',
        link: '/invoices',
        read: true,
      },
      {
        title: 'Invoice Due Soon: INV-2026-0031',
        message: 'Invoice for Jenkins Architecture ($945.00) is due in 3 days.',
        type: 'invoice_overdue',
        link: '/invoices',
        read: false,
      },
      {
        title: 'Team Member Joined',
        message: 'Sophia Patel has joined the workspace as Manager.',
        type: 'team_invite',
        link: '/team',
        read: true,
      },
    ];

    for (const notif of notificationList) {
      await Notification.create({
        businessId: business._id,
        ...notif,
      });
    }

    console.log(`[Seed] ${notificationList.length} notifications seeded.`);
    console.log('[Seed] Database seeding completed successfully!');
    console.log('====================================================');
    console.log('BIZMIND AI DEMO CREDENTIALS:');
    console.log('Super Admin:     abdullahanis592@gmail.com / Password123!');
    console.log('Owner Account:   owner@bizmind.ai          / Password123!');
    console.log('Manager Account: manager@bizmind.ai        / Password123!');
    console.log('Staff Account:   staff@bizmind.ai          / Password123!');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
