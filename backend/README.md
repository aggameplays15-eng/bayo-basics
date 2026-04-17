# Bayo Basics Backend API

API REST pour l'application e-commerce Bayo Basics.

## Stack Technique

- **Node.js** + **Express**
- **PostgreSQL** (Neon)
- **JWT** pour l'authentification
- **bcryptjs** pour le hash des mots de passe

## Démarrage Rapide

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Configuration

Le fichier `.env` est déjà configuré avec ta base Neon. Vérifie juste :

```env
DATABASE_URL=postgresql://neondb_owner:npg_LHS0KGqD4xak@ep-square-wave-ano69tc4-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=bayo_secret_key_2024_secure_random_string
PORT=3001
```

### 3. Création des tables

```bash
npm run db:setup
```

Cela crée toutes les tables et insère :
- 1 utilisateur admin : `admin@bayo.com` / `admin123`
- 6 produits d'exemple
- 4 zones de livraison (Conakry)
- 1 bannière par défaut

### 4. Démarrage

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur **http://localhost:3001**

## Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur connecté
- `PUT /api/auth/profile` - Modifier profil
- `PUT /api/auth/password` - Changer mot de passe

### Produits (public)
- `GET /api/products` - Liste des produits
- `GET /api/products?category=Vêtements` - Filtrer par catégorie
- `GET /api/products?search=term` - Rechercher
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/products/meta/categories` - Liste des catégories

### Produits (admin - require auth)
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Commandes
- `POST /api/orders` - Créer une commande (auth)
- `GET /api/orders/my-orders` - Mes commandes (auth)
- `GET /api/orders/:id` - Détails d'une commande (auth)
- `GET /api/orders` - Toutes les commandes (admin)
- `PUT /api/orders/:id/status` - Modifier statut (admin)

### Favoris (auth)
- `GET /api/favorites` - Mes favoris
- `POST /api/favorites` - Ajouter aux favoris
- `DELETE /api/favorites/:productId` - Retirer des favoris
- `GET /api/favorites/check/:productId` - Vérifier si favori

### Livraison (public)
- `GET /api/delivery` - Zones de livraison
- `POST /api/delivery` - Ajouter zone (admin)
- `PUT /api/delivery/:id` - Modifier zone (admin)
- `DELETE /api/delivery/:id` - Supprimer zone (admin)

### Paramètres (public)
- `GET /api/settings` - Paramètres site + bannières

### Paramètres (admin)
- `PUT /api/settings` - Modifier paramètres
- `POST /api/settings/banners` - Ajouter bannière
- `PUT /api/settings/banners/:id` - Modifier bannière
- `DELETE /api/settings/banners/:id` - Supprimer bannière

## Schéma de la Base de Données

```
users (id, email, password_hash, name, phone, address, role, created_at)
products (id, name, description, price, category, image_url, stock, sizes[], colors[], is_active)
orders (id, user_id, customer_name, email, phone, address, city, delivery_fee, total, status, created_at)
order_items (id, order_id, product_id, product_name, product_price, quantity, selected_size, selected_color)
favorites (id, user_id, product_id, created_at)
delivery_zones (id, name, price, created_at)
site_settings (id, logo_text, logo_image, hero_title, hero_subtitle, updated_at)
banners (id, image_url, title, subtitle, link, display_order, is_active, created_at)
```

## Authentification

Toutes les routes protégées nécessitent un header :

```
Authorization: Bearer <token>
```

Le token est obtenu lors du login/register et doit être stocké dans `localStorage`.

## Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Tokens JWT avec expiration 7 jours
- Protection CORS configurée
- Requêtes SQL paramétrées (protection injection)
- Transactions pour les commandes (consistance stock)

## Déploiement

Pour déployer sur Railway/Render/Vercel :

1. Définir les variables d'environnement :
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL` (optionnel)

2. Commande de démarrage : `npm start`

3. Build automatique : `npm install`
