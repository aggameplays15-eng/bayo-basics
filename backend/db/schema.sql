-- Bayo Basics Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery zones
CREATE TABLE IF NOT EXISTS delivery_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Vêtements', 'Électronique', 'Accessoires', 'Chaussures', 'Général')),
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    sizes TEXT[],
    colors TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    delivery_fee INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'En attente' CHECK (status IN ('En attente', 'Livré', 'Annulé')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_size VARCHAR(50),
    selected_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites (wishlist) table
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    logo_text VARCHAR(255) DEFAULT 'BAYO',
    logo_image TEXT,
    hero_title VARCHAR(500) DEFAULT 'Le style Premium accessible.',
    hero_subtitle VARCHAR(500) DEFAULT 'Qualité garantie, paiement à la livraison.',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500) NOT NULL,
    link VARCHAR(500) DEFAULT '/products',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password set via setup.js with bcrypt)
INSERT INTO users (email, password_hash, name, role) 
VALUES ('mohamedddbayo@gmail.com', '$2a$10$placeholder', 'Mohamed', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default delivery zones
INSERT INTO delivery_zones (name, price) VALUES
    ('Kaloum', 15000),
    ('Dixinn / Ratoma', 20000),
    ('Matoto', 25000),
    ('Coyah / Dubréka', 40000)
ON CONFLICT DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (id, logo_text, hero_title, hero_subtitle)
VALUES (1, 'BAYO', 'Le style Premium accessible.', 'Qualité garantie, paiement à la livraison.')
ON CONFLICT (id) DO NOTHING;

-- Insert default banner
INSERT INTO banners (image_url, title, subtitle, link, display_order)
VALUES (
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    'Nouvelle Collection',
    'Découvrez les tendances',
    '/products',
    1
)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
