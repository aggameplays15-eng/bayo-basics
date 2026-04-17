"use client";

import { useState, useEffect } from 'react';
import { Product, Order, DeliveryZone, SiteSettings, BannerItem } from '../types';

export const useAdminData = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('admin_products');
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "T-shirt Bayo Premium", description: "Coton 100% bio", price: 150000, category: "Vêtements", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", stock: 10 },
      { id: "2", name: "Écouteurs Sans Fil Pro", description: "Réduction de bruit", price: 450000, category: "Électronique", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", stock: 5 },
      { id: "3", name: "Montre Élégance", description: "Design minimaliste", price: 300000, category: "Accessoires", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", stock: 8 },
    ];
  });

  const [zones, setZones] = useState<DeliveryZone[]>(() => {
    const saved = localStorage.getItem('admin_zones');
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Kaloum", price: 15000 },
      { id: "2", name: "Dixinn / Ratoma", price: 20000 },
      { id: "3", name: "Matoto", price: 25000 },
      { id: "4", name: "Coyah / Dubréka", price: 40000 },
    ];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('admin_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('admin_settings');
    return saved ? JSON.parse(saved) : {
      logoText: "BAYO",
      heroTitle: "Le style Premium accessible.",
      heroSubtitle: "Qualité garantie, paiement à la livraison. Découvrez notre sélection 2024.",
      banners: [
        { id: "1", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200", title: "Nouvelle Collection", subtitle: "Découvrez les tendances", link: "/products" }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('admin_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('admin_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
  }, [settings]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addZone = (zone: Omit<DeliveryZone, 'id'>) => {
    const newZone = { ...zone, id: Math.random().toString(36).substr(2, 9) };
    setZones(prev => [...prev, newZone]);
  };

  const updateZone = (id: string, updates: Partial<DeliveryZone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const addBanner = (banner: Omit<BannerItem, 'id'>) => {
    const newBanner = { ...banner, id: Math.random().toString(36).substr(2, 9) };
    setSettings(prev => ({ ...prev, banners: [...prev.banners, newBanner] }));
  };

  const deleteBanner = (id: string) => {
    setSettings(prev => ({ ...prev, banners: prev.banners.filter(b => b.id !== id) }));
  };

  return { 
    products, orders, zones, settings,
    addProduct, updateProduct, deleteProduct, 
    addZone, updateZone, deleteZone, 
    updateOrderStatus, updateSettings, addBanner, deleteBanner 
  };
};