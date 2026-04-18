"use client";

import { useState, useEffect, useCallback } from 'react';
import { productsAPI, ordersAPI, deliveryAPI, settingsAPI } from '../services/api';
import type { Product, Order, DeliveryZone, SiteSettings, BannerItem } from '../types';

// Hook for admin data management
export const useApiData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    logoText: "BAYO",
    heroTitle: "Le style Premium accessible.",
    heroSubtitle: "Qualité garantie, paiement à la livraison.",
    banners: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data from API...');
        
        // Fetch products
        const productsRes = await productsAPI.getAll();
        console.log('Products fetched:', productsRes);
        setProducts(productsRes.products);
        
        // Fetch settings
        const settingsRes = await settingsAPI.get();
        console.log('Settings fetched:', settingsRes);
        setSettings(settingsRes.settings);
        
        // Fetch zones
        const zonesRes = await deliveryAPI.getZones();
        console.log('Zones fetched:', zonesRes);
        setZones(zonesRes.zones);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Product CRUD
  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
      const response = await productsAPI.create(product);
      setProducts(prev => [response.product, ...prev]);
      return response.product;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const response = await productsAPI.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? response.product : p));
      return response.product;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  }, []);

  // Zone CRUD
  const addZone = useCallback(async (zone: Omit<DeliveryZone, 'id'>) => {
    try {
      const response = await deliveryAPI.createZone(zone);
      setZones(prev => [...prev, response.zone]);
      return response.zone;
    } catch (err) {
      console.error('Error adding zone:', err);
      throw err;
    }
  }, []);

  const updateZone = useCallback(async (id: string, updates: Partial<DeliveryZone>) => {
    try {
      const response = await deliveryAPI.updateZone(id, updates);
      setZones(prev => prev.map(z => z.id === id ? response.zone : z));
      return response.zone;
    } catch (err) {
      console.error('Error updating zone:', err);
      throw err;
    }
  }, []);

  const deleteZone = useCallback(async (id: string) => {
    try {
      await deliveryAPI.deleteZone(id);
      setZones(prev => prev.filter(z => z.id !== id));
    } catch (err) {
      console.error('Error deleting zone:', err);
      throw err;
    }
  }, []);

  // Orders
  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    try {
      const response = await ordersAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: response.order.status } : o));
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }, []);

  // Settings
  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    try {
      const response = await settingsAPI.update(updates);
      setSettings(prev => ({ ...prev, ...response.settings }));
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }, []);

  // Banners
  const addBanner = useCallback(async (banner: Omit<BannerItem, 'id'>) => {
    try {
      const response = await settingsAPI.createBanner(banner);
      setSettings(prev => ({
        ...prev,
        banners: [...prev.banners, response.banner]
      }));
      return response.banner;
    } catch (err) {
      console.error('Error adding banner:', err);
      throw err;
    }
  }, []);

  const deleteBanner = useCallback(async (id: string) => {
    try {
      await settingsAPI.deleteBanner(id);
      setSettings(prev => ({
        ...prev,
        banners: prev.banners.filter(b => b.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting banner:', err);
      throw err;
    }
  }, []);

  // Refresh orders (for admin)
  const refreshOrders = useCallback(async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.orders);
    } catch (err) {
      console.error('Error refreshing orders:', err);
    }
  }, []);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.products);
    } catch (err) {
      console.error('Error refreshing products:', err);
    }
  }, []);

  return {
    products,
    orders,
    zones,
    settings,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addZone,
    updateZone,
    deleteZone,
    updateOrderStatus,
    updateSettings,
    addBanner,
    deleteBanner,
    refreshOrders,
    refreshProducts
  };
};
