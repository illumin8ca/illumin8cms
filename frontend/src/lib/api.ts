import axios from 'axios';

// API Configuration
// For Cloudflare Pages Functions, we use the same origin
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Types
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  inStock: boolean;
  careInstructions: string;
}

export interface HomepageContent {
  id: number;
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  featuredSection: {
    title: string;
    subtitle: string;
  };
  aboutPreview: {
    title: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
}

export interface AboutContent {
  id: number;
  title: string;
  subtitle: string;
  mainImage: string;
  story: string[];
  philosophy: {
    title: string;
    content: string;
  };
  process: {
    title: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  location: {
    title: string;
    description: string;
  };
}

export interface ContactContent {
  id: number;
  title: string;
  subtitle: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  customQuiltInfo: {
    title: string;
    description: string;
    process: string[];
    timeline: string;
    startingPrice: string;
  };
}

export interface SiteSettings {
  id: number;
  siteName: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    pinterest: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}

export interface CustomQuoteRequest {
  name: string;
  email: string;
  phone?: string;
  quiltType: string;
  size: string;
  colors: string;
  timeline: string;
  description: string;
}

// API Functions
export const apiService = {
  // Products
  async getProducts(category?: string, sort?: string): Promise<Product[]> {
    try {
      const response = await api.get('/products');
      let products = response.data.data;
      
      // Apply category filter
      if (category && category !== 'all') {
        products = products.filter((product: Product) => 
          product.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Apply sorting
      if (sort) {
        switch (sort) {
          case 'price-low':
            products.sort((a: Product, b: Product) => a.price - b.price);
            break;
          case 'price-high':
            products.sort((a: Product, b: Product) => b.price - a.price);
            break;
          case 'name':
            products.sort((a: Product, b: Product) => a.title.localeCompare(b.title));
            break;
          default:
            // Default order
            break;
        }
      }
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getProduct(id: number): Promise<Product | null> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products');
      const products = response.data.data;
      return products.filter((product: Product) => product.featured);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  // CMS Content
  async getHomepageContent(): Promise<HomepageContent | null> {
    try {
      const response = await api.get('/homepage');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      return null;
    }
  },

  async getAboutContent(): Promise<AboutContent | null> {
    try {
      const response = await api.get('/about');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching about content:', error);
      return null;
    }
  },

  async getContactContent(): Promise<ContactContent | null> {
    try {
      const response = await api.get('/contact');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching contact content:', error);
      return null;
    }
  },

  async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const response = await api.get('/site-settings');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }
  },

  // Contact
  async submitContact(data: ContactSubmission): Promise<boolean> {
    try {
      await api.post('/contact', data);
      return true;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return false;
    }
  },

  // Custom Quotes
  async submitCustomQuote(data: CustomQuoteRequest): Promise<boolean> {
    try {
      await api.post('/custom-quote', data);
      return true;
    } catch (error) {
      console.error('Error submitting custom quote request:', error);
      return false;
    }
  },

  // Orders
  async createOrder(orderData: any): Promise<any> {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
};

// Helper function to get media URL
export const getMediaUrl = (url: string): string => {
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:1337';
  return `${baseUrl}${url}`;
};

export default apiService; 