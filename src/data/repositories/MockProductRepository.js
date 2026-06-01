import { Product } from '../../domain/entities/Product.js';

const STORAGE_KEY = 'expend_note_products_v2';

export class MockProductRepository {
  constructor() {
    this.categories = [
      { name: 'ភេសជ្ជៈ', color: '#3b82f6' },
      { name: 'អាហារ', color: '#f59e0b' },
      { name: 'ផ្សេងៗ', color: '#8b5cf6' }
    ];

    this.iconOptions = ['☕', '🥤', '💧', '🌊', '🍜', '🍱', '🍕', '🛒', '🚗', '💊'];

    this._initializeMockDataIfEmpty();
  }

  _initializeMockDataIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const defaultProducts = [
        { id: 1, name: 'កាហ្វេ', price: 5000, icon: '☕', category: 'ភេសជ្ជៈ' },
        { id: 2, name: 'V-Coffee', price: 5000, icon: '🥤', category: 'ភេសជ្ជៈ' },
        { id: 3, name: 'ទឹកតូច', price: 2000, icon: '💧', category: 'ភេសជ្ជៈ' },
        { id: 4, name: 'ទឹកធំ', price: 3000, icon: '🌊', category: 'ភេសជ្ជៈ' },
        { id: 5, name: 'បាយ', price: 8000, icon: '🍱', category: 'អាហារ' },
        { id: 6, name: 'ហ្វូ', price: 7000, icon: '🍜', category: 'អាហារ' }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    }
  }

  async getCategories() {
    return this.categories;
  }

  async getIconOptions() {
    return this.iconOptions;
  }

  async getProducts() {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return [];
    try {
      const data = JSON.parse(dataStr);
      return data.map(item => new Product(item));
    } catch (e) {
      console.error('Error parsing products', e);
      return [];
    }
  }

  async addProduct(productData) {
    const products = await this.getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = new Product({ ...productData, id: newId });
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = new Product({ ...products[index], ...updates });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      return products[index];
    }
    return null;
  }
}
