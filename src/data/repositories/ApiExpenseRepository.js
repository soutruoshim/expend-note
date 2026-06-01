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

export class ApiExpenseRepository {
  async add(expense) {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expense)
    });
    return response.json();
  }

  async getAll() {
    const response = await fetch('/api/expenses', { headers: getHeaders() });
    return response.json();
  }

  async getByDateRange(startDate, endDate) {
    const all = await this.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return all.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
  }

  async delete(id) {
    await fetch(`/api/expenses/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
  }
}
