import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% cotton t-shirt',
        price: 29.99,
        compareAtPrice: 39.99,
        sku: 'PCT-M-BLK',
        barcode: '123456789012',
        inventory: 150,
        vendor: 'Fashion Co',
        productType: 'Apparel',
        tags: ['clothing', 't-shirt', 'cotton'],
        images: [
          'https://example.com/tshirt1.jpg',
          'https://example.com/tshirt2.jpg',
        ],
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        title: 'Wireless Bluetooth Headphones',
        description: 'Noise-cancelling over-ear headphones',
        price: 99.99,
        compareAtPrice: 149.99,
        sku: 'WBH-BLK',
        barcode: '987654321098',
        inventory: 75,
        vendor: 'Tech Gear',
        productType: 'Electronics',
        tags: ['electronics', 'audio', 'wireless'],
        images: ['https://example.com/headphones.jpg'],
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        title: 'Organic Coffee Blend',
        description: 'Premium organic coffee beans',
        price: 14.99,
        compareAtPrice: 19.99,
        sku: 'OCB-250G',
        barcode: '456789123456',
        inventory: 200,
        vendor: 'Coffee Roasters',
        productType: 'Food & Beverage',
        tags: ['coffee', 'organic', 'beverage'],
        images: ['https://example.com/coffee.jpg'],
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        title: 'Yoga Mat',
        description: 'Non-slip exercise mat',
        price: 24.99,
        sku: 'YM-PURPLE',
        inventory: 50,
        vendor: 'Fitness Pro',
        productType: 'Sports',
        tags: ['fitness', 'yoga', 'exercise'],
        status: 'active',
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        acceptsMarketing: true,
        totalSpent: 254.97,
        ordersCount: 2,
        tags: ['vip', 'repeat-customer'],
        verifiedEmail: true,
        addresses: {
          create: [
            {
              firstName: 'John',
              lastName: 'Doe',
              address1: '123 Main St',
              city: 'New York',
              province: 'NY',
              country: 'United States',
              zip: '10001',
              phone: '+1234567890',
              isDefault: true,
            },
          ],
        },
      },
    }),
    prisma.customer.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+0987654321',
        acceptsMarketing: false,
        totalSpent: 99.99,
        ordersCount: 1,
        tags: ['new'],
        verifiedEmail: true,
        addresses: {
          create: [
            {
              firstName: 'Jane',
              lastName: 'Smith',
              address1: '456 Oak Ave',
              city: 'Los Angeles',
              province: 'CA',
              country: 'United States',
              zip: '90001',
              isDefault: true,
            },
          ],
        },
      },
    }),
    prisma.customer.create({
      data: {
        email: 'bob.johnson@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        totalSpent: 0,
        ordersCount: 0,
        tags: ['potential'],
        verifiedEmail: false,
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: '#1001',
      customerId: customers[0].id,
      email: customers[0].email,
      financialStatus: 'paid',
      fulfillmentStatus: 'fulfilled',
      totalPrice: 154.98,
      subtotalPrice: 144.98,
      totalTax: 10.00,
      currency: 'USD',
      paymentMethod: 'credit_card',
      shippingMethod: 'standard',
      shippingPrice: 0,
      tags: ['completed'],
      lineItems: {
        create: [
          {
            productId: products[0].id,
            title: products[0].title,
            quantity: 2,
            price: products[0].price,
            sku: products[0].sku,
          },
          {
            productId: products[1].id,
            title: products[1].title,
            quantity: 1,
            price: products[1].price,
            sku: products[1].sku,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: '#1002',
      customerId: customers[1].id,
      email: customers[1].email,
      financialStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      totalPrice: 99.99,
      subtotalPrice: 99.99,
      totalTax: 0,
      currency: 'USD',
      tags: ['new'],
      lineItems: {
        create: [
          {
            productId: products[1].id,
            title: products[1].title,
            quantity: 1,
            price: products[1].price,
            sku: products[1].sku,
          },
        ],
      },
    },
  });

  console.log('✅ Created 2 orders');

  // Create Reviews
  await prisma.review.create({
    data: {
      productId: products[0].id,
      customerId: customers[0].id,
      rating: 5,
      title: 'Excellent quality!',
      content: 'The t-shirt is very comfortable and the quality is amazing.',
      status: 'published',
      verified: true,
      helpful: 12,
      notHelpful: 1,
      publishedAt: new Date(),
    },
  });

  await prisma.review.create({
    data: {
      productId: products[1].id,
      customerId: customers[0].id,
      rating: 4,
      title: 'Good headphones',
      content: 'Sound quality is great, but they could be more comfortable for long use.',
      status: 'published',
      verified: true,
      helpful: 8,
      notHelpful: 2,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created 2 reviews');

  // Create Inventory Alerts
  await prisma.inventoryAlert.create({
    data: {
      productId: products[3].id,
      sku: products[3].sku,
      productName: products[3].title,
      currentStock: products[3].inventory,
      threshold: 100,
      alertType: 'low',
      status: 'active',
      note: 'Stock running low, consider reordering',
    },
  });

  console.log('✅ Created 1 inventory alert');

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });