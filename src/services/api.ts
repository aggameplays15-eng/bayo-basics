const API_URL = (import.meta as any).env?.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/_/backend/api');

// Types
export interface ApiError {
    error: string;
    message?: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

// Get stored token
const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Store token
export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

// Remove token
export const removeToken = (): void => {
    localStorage.removeItem('token');
};

// Base fetch function
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
    };
    
    // Add auth token if available
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, config);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data as T;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    register: (data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        address?: string;
    }) => apiFetch<{
        message: string;
        user: User;
        token: string;
    }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    login: (data: { email: string; password: string }) => apiFetch<{
        message: string;
        user: User;
        token: string;
    }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    getMe: () => apiFetch<{ user: User }>('/auth/me'),
    
    updateProfile: (data: {
        name?: string;
        phone?: string;
        address?: string;
    }) => apiFetch<{
        message: string;
        user: User;
    }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    changePassword: (data: {
        currentPassword: string;
        newPassword: string;
    }) => apiFetch<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// Products API
export const productsAPI = {
    getAll: (params?: {
        category?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        
        const query = queryParams.toString();
        return apiFetch<{ products: Product[] }>(`/products${query ? `?${query}` : ''}`);
    },
    
    getById: (id: string) => apiFetch<{ product: Product }>(`/products/${id}`),
    
    create: (data: Omit<Product, 'id' | 'isActive'>) => apiFetch<{
        message: string;
        product: Product;
    }>('/products', {
        method: 'POST',
        body: JSON.stringify({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            image_url: data.image,
            stock: data.stock,
            sizes: data.sizes,
            colors: data.colors
        })
    }),
    
    update: (id: string, data: Partial<Product>) => apiFetch<{
        message: string;
        product: Product;
    }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            image_url: data.image,
            stock: data.stock,
            sizes: data.sizes,
            colors: data.colors,
            is_active: data.isActive
        })
    }),
    
    delete: (id: string) => apiFetch<{ message: string }>(`/products/${id}`, {
        method: 'DELETE'
    }),
    
    getCategories: () => apiFetch<{ categories: string[] }>('/products/meta/categories')
};

// Orders API
export const ordersAPI = {
    create: (data: {
        items: CartItem[];
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        address: string;
        city: string;
        delivery_fee: number;
    }) => apiFetch<{
        message: string;
        order: Order;
    }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    getMyOrders: () => apiFetch<{ orders: Order[] }>('/orders/my-orders'),
    
    getById: (id: string) => apiFetch<{ order: Order }>(`/orders/${id}`),
    
    // Admin only
    getAll: (params?: { status?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        
        const query = queryParams.toString();
        return apiFetch<{ orders: Order[] }>(`/orders${query ? `?${query}` : ''}`);
    },
    
    updateStatus: (id: string, status: Order['status']) => apiFetch<{
        message: string;
        order: { id: string; status: Order['status']; updatedAt: string };
    }>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    })
};

// Favorites API
export const favoritesAPI = {
    getAll: () => apiFetch<{ favorites: Product[] }>('/favorites'),
    
    add: (productId: string) => apiFetch<{ message: string }>('/favorites', {
        method: 'POST',
        body: JSON.stringify({ productId: parseInt(productId) })
    }),
    
    remove: (productId: string) => apiFetch<{ message: string }>(`/favorites/${productId}`, {
        method: 'DELETE'
    }),
    
    check: (productId: string) => apiFetch<{ isFavorite: boolean }>(`/favorites/check/${productId}`)
};

// Delivery API
export const deliveryAPI = {
    getZones: () => apiFetch<{ zones: DeliveryZone[] }>('/delivery'),
    
    createZone: (data: { name: string; price: number }) => apiFetch<{
        message: string;
        zone: DeliveryZone;
    }>('/delivery', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    updateZone: (id: string, data: { name?: string; price?: number }) => apiFetch<{
        message: string;
        zone: DeliveryZone;
    }>(`/delivery/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    deleteZone: (id: string) => apiFetch<{ message: string }>(`/delivery/${id}`, {
        method: 'DELETE'
    })
};

// Settings API
export const settingsAPI = {
    get: () => apiFetch<{ settings: SiteSettings }>('/settings'),
    
    update: (data: Partial<SiteSettings>) => apiFetch<{
        message: string;
        settings: Partial<SiteSettings>;
    }>('/settings', {
        method: 'PUT',
        body: JSON.stringify({
            logoText: data.logoText,
            logoImage: data.logoImage,
            heroTitle: data.heroTitle,
            heroSubtitle: data.heroSubtitle
        })
    }),
    
    createBanner: (data: Omit<BannerItem, 'id'>) => apiFetch<{
        message: string;
        banner: BannerItem;
    }>('/settings/banners', {
        method: 'POST',
        body: JSON.stringify({
            image_url: data.image,
            title: data.title,
            subtitle: data.subtitle,
            link: data.link
        })
    }),
    
    updateBanner: (id: string, data: Partial<BannerItem>) => apiFetch<{
        message: string;
        banner: BannerItem;
    }>(`/settings/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            image_url: data.image,
            title: data.title,
            subtitle: data.subtitle,
            link: data.link,
            is_active: data.isActive
        })
    }),
    
    deleteBanner: (id: string) => apiFetch<{ message: string }>(`/settings/banners/${id}`, {
        method: 'DELETE'
    })
};

// Import types
import type { User, Product, CartItem, Order, DeliveryZone, SiteSettings, BannerItem } from '../types';
