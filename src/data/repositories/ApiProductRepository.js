function getUserId() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  }
  return 'default';
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getUserId()
  };
}

export class ApiProductRepository {
  async getCategories() {
    const response = await fetch('/api/categories', { headers: getHeaders() });
    return response.json();
  }

  async getIconOptions() {
    const response = await fetch('/api/icons', { headers: getHeaders() });
    return response.json();
  }

  async getProducts() {
    const response = await fetch('/api/products', { headers: getHeaders() });
    return response.json();
  }

  async addProduct(product) {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product)
    });
    return response.json();
  }

  async updateProduct(id, productData) {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return response.json();
  }
}
