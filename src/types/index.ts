export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Vêtements' | 'Électronique' | 'Accessoires' | 'Général';
  image: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
  isActive?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
}

export interface BannerItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface SiteSettings {
  logoText: string;
  logoImage?: string;
  heroTitle: string;
  heroSubtitle: string;
  banners: BannerItem[];
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  deliveryFee: number;
  items: CartItem[];
  total: number;
  status: 'En attente' | 'Livré' | 'Annulé';
  createdAt: string;
}