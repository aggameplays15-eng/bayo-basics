import pool from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    try {
        console.log('🚀 Setting up database...');
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        
        // Execute schema statements
        await pool.query(schema);
        
        // Hash default admin password
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        // Update admin password with hashed version
        await pool.query(
            `UPDATE users SET password_hash = $1 WHERE email = 'admin@bayo.com'`,
            [hashedPassword]
        );
        
        console.log('✅ Database setup complete!');
        console.log('   Default admin: admin@bayo.com / admin123');
        
        // Insert sample products if none exist
        const productsResult = await pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(productsResult.rows[0].count) === 0) {
            console.log('📝 Inserting sample products...');
            
            const sampleProducts = [
                {
                    name: 'T-shirt Bayo Premium',
                    description: 'Coton 100% bio, confortable et durable.',
                    price: 150000,
                    category: 'Vêtements',
                    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
                    stock: 10,
                    sizes: ['S', 'M', 'L', 'XL'],
                    colors: ['Noir', 'Blanc', 'Bleu']
                },
                {
                    name: 'Écouteurs Sans Fil Pro',
                    description: 'Réduction de bruit active et autonomie de 24h.',
                    price: 450000,
                    category: 'Électronique',
                    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                    stock: 5,
                    colors: ['Noir', 'Blanc']
                },
                {
                    name: 'Montre Élégance',
                    description: 'Design minimaliste avec bracelet en cuir.',
                    price: 300000,
                    category: 'Accessoires',
                    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                    stock: 8,
                    colors: ['Noir', 'Marron', 'Or']
                },
                {
                    name: 'Smartphone X10',
                    description: 'Écran OLED 6.7 pouces, triple capteur photo.',
                    price: 2500000,
                    category: 'Électronique',
                    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                    stock: 3,
                    colors: ['Noir', 'Bleu', 'Argent']
                },
                {
                    name: 'Jean Slim Fit',
                    description: 'Coupe moderne et tissu extensible.',
                    price: 200000,
                    category: 'Vêtements',
                    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
                    stock: 15,
                    sizes: ['30', '32', '34', '36'],
                    colors: ['Bleu', 'Noir']
                },
                {
                    name: 'Sac à dos Voyage',
                    description: 'Imperméable avec compartiment ordinateur.',
                    price: 350000,
                    category: 'Accessoires',
                    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
                    stock: 7,
                    colors: ['Noir', 'Gris', 'Bleu']
                }
            ];
            
            for (const product of sampleProducts) {
                await pool.query(
                    `INSERT INTO products (name, description, price, category, image_url, stock, sizes, colors)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        product.name,
                        product.description,
                        product.price,
                        product.category,
                        product.image_url,
                        product.stock,
                        product.sizes || null,
                        product.colors || null
                    ]
                );
            }
            
            console.log(`✅ ${sampleProducts.length} sample products inserted`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
