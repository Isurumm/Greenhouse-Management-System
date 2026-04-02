const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const seedUsers = [
  {
    fullName: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    phone: '1234567890',
    address: '123 Admin St',
  },
  {
    fullName: 'Polytunnel Manager',
    email: 'poly@example.com',
    password: 'password123',
    role: 'polytunnelManager',
    phone: '1112223333',
    address: '10 Tunnel Rd',
  },
  {
    fullName: 'Inventory Manager',
    email: 'inventory@example.com',
    password: 'password123',
    role: 'inventoryManager',
    phone: '4445556666',
    address: '20 Stock Ave',
  },
  {
    fullName: 'Order Manager',
    email: 'order@example.com',
    password: 'password123',
    role: 'orderManager',
    phone: '7778889999',
    address: '30 Order Blvd',
  },
  {
    fullName: 'User & Delivery Manager',
    email: 'userdelivery@example.com',
    password: 'password123',
    role: 'userCustomerManager',
    phone: '0001112222',
    address: '40 Delivery Ln',
  },
  {
    fullName: 'John Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
    phone: '0987654321',
    address: '456 Customer Ave',
  },
];

const seedProducts = [
  {
    name: 'Fresh Premium Tomatoes',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80',
    description: 'Hydroponically grown fresh tomatoes from our temperature-controlled polytunnels.',
    category: 'Vegetables',
    price: 4.99,
    countInStock: 50,
  },
  {
    name: 'Organic Cucumbers',
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&q=80',
    description: 'Crisp and hydrating cucumbers harvested daily.',
    category: 'Vegetables',
    price: 2.49,
    countInStock: 30,
  },
  {
    name: 'Bell Peppers Assortment',
    image: 'https://images.unsplash.com/photo-1563565375-f3fbfc222291?auto=format&fit=crop&q=80',
    description: 'A mix of red, yellow, and green bell peppers.',
    category: 'Vegetables',
    price: 5.99,
    countInStock: 15,
  },
  {
    name: 'Hydroponic Strawberries',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80',
    description: 'Sweet, vibrant red strawberries cultivated in our specialized berry tunnels.',
    category: 'Fruits',
    price: 6.99,
    countInStock: 20,
  },
];

const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Old data cleared.');

    // Create users one-by-one so pre('save') hook hashes passwords
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`  ✔ Created user: ${user.email} (${user.role})`);
    }

    // Seed products
    await Product.insertMany(seedProducts);
    console.log(`  ✔ Created ${seedProducts.length} products`);

    console.log('\n✅ Data Imported Successfully!');
    console.log('\n--- Demo Login Credentials ---');
    console.log('Password for ALL users: password123\n');
    seedUsers.forEach((u) => {
      console.log(`  ${u.role.padEnd(22)} → ${u.email}`);
    });

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
