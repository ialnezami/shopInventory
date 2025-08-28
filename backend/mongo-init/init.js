// MongoDB initialization script for Shop Inventory System
db = db.getSiblingDB('shop_inventory');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('customers');
db.createCollection('sales');
db.createCollection('invoices');
db.createCollection('inventory');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "sku": 1 }, { unique: true });
db.products.createIndex({ "name": 1 });
db.customers.createIndex({ "email": 1 });
db.sales.createIndex({ "date": -1 });
db.invoices.createIndex({ "invoiceNumber": 1 }, { unique: true });

print('Shop Inventory database initialized successfully!');
