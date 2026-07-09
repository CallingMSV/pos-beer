-- Beer POS Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff / Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'cashier', -- superadmin, manager, cashier, kitchen, bar
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables (floor plan)
CREATE TABLE floor_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(20) NOT NULL,
  capacity INT DEFAULT 4,
  pos_x FLOAT DEFAULT 0,
  pos_y FLOAT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available', -- available, occupied, reserved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) DEFAULT 'food' -- food, drink, beer
);

-- Products / Menu
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(200) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  unit VARCHAR(30) DEFAULT 'pcs',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers / Members
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  points INT DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'normal', -- normal, silver, gold, vip
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  table_id UUID REFERENCES floor_tables(id),
  customer_id UUID REFERENCES customers(id),
  reserved_at TIMESTAMPTZ NOT NULL,
  guests INT DEFAULT 1,
  note TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, done
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  table_id UUID REFERENCES floor_tables(id),
  customer_id UUID REFERENCES customers(id),
  staff_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'open', -- open, paid, cancelled
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  service_charge NUMERIC(10,2) DEFAULT 0,
  vat NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  payment_method VARCHAR(30),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name VARCHAR(200) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  note TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bottle Keeper
CREATE TABLE bottle_keepers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  bottle_label VARCHAR(100),
  remaining NUMERIC(6,2) DEFAULT 0,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  note TEXT
);

-- Promotions
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(30) NOT NULL, -- percent, fixed, buy_x_get_y
  value NUMERIC(10,2) DEFAULT 0,
  min_amount NUMERIC(10,2) DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  product_id UUID REFERENCES products(id),
  type VARCHAR(20) NOT NULL, -- in, out, adjust
  qty INT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50),
  entity_id UUID,
  detail JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default branch and superadmin
INSERT INTO branches (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Main Branch');
-- password: admin1234 (bcrypt)
INSERT INTO users (branch_id, name, email, password_hash, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'admin@beerpos.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'superadmin'
);
