// Base API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ في الاتصال بالخادم');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ غير متوقع');
  }
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  totalAmount?: number;
  totalRevenue?: number;
}

// Menu Item types (matching backend model)
export interface MenuItem {
  _id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  halfPrice?: number | null;
  quarterPrice?: number | null;
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemDTO {
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  halfPrice?: number | null;
  quarterPrice?: number | null;
  category: string;
  image?: string;
  isAvailable?: boolean;
}

// Order types (matching backend model)
export interface OrderItem {
  menuItem: string | MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  paymentMethod: 'cash' | 'card';
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  items: {
    menuItem: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  paymentMethod?: 'cash' | 'card';
  notes?: string;
}

// Expense types (matching backend model)
export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: 'ingredients' | 'utilities' | 'salaries' | 'rent' | 'equipment' | 'other';
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  title: string;
  amount: number;
  category: 'ingredients' | 'utilities' | 'salaries' | 'rent' | 'equipment' | 'other';
  description?: string;
  date?: string;
}

// ============ MENU API ============
export const menuApi = {
  // Get all menu items
  getAll: async (params?: { category?: string; available?: boolean }) => {
    let endpoint = '/menu';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.available !== undefined) queryParams.append('available', String(params.available));
      if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
    }
    return fetchApi<ApiResponse<MenuItem[]>>(endpoint);
  },

  // Get single menu item
  getById: async (id: string) => {
    return fetchApi<ApiResponse<MenuItem>>(`/menu/${id}`);
  },

  // Create menu item
  create: async (data: CreateMenuItemDTO) => {
    return fetchApi<ApiResponse<MenuItem>>('/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update menu item
  update: async (id: string, data: Partial<CreateMenuItemDTO>) => {
    return fetchApi<ApiResponse<MenuItem>>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete menu item
  delete: async (id: string) => {
    return fetchApi<ApiResponse<null>>(`/menu/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ ORDERS API ============
export const ordersApi = {
  // Get all orders
  getAll: async (params?: { status?: string; date?: string; orderType?: string }) => {
    let endpoint = '/orders';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.date) queryParams.append('date', params.date);
      if (params.orderType) queryParams.append('orderType', params.orderType);
      if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
    }
    return fetchApi<ApiResponse<Order[]>>(endpoint);
  },

  // Get today's orders
  getToday: async () => {
    return fetchApi<ApiResponse<Order[]> & { totalRevenue: number }>('/orders/today');
  },

  // Get single order
  getById: async (id: string) => {
    return fetchApi<ApiResponse<Order>>(`/orders/${id}`);
  },

  // Create order
  create: async (data: CreateOrderDTO) => {
    return fetchApi<ApiResponse<Order>>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update order
  update: async (id: string, data: Partial<Order>) => {
    return fetchApi<ApiResponse<Order>>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update order status
  updateStatus: async (id: string, status: Order['status']) => {
    return fetchApi<ApiResponse<Order>>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete order
  delete: async (id: string) => {
    return fetchApi<ApiResponse<null>>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ EXPENSES API ============
export const expensesApi = {
  // Get all expenses
  getAll: async (params?: { category?: string; startDate?: string; endDate?: string }) => {
    let endpoint = '/expenses';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
    }
    return fetchApi<ApiResponse<Expense[]> & { totalAmount: number }>(endpoint);
  },

  // Get expenses summary
  getSummary: async (params?: { month?: number; year?: number }) => {
    let endpoint = '/expenses/summary';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.month) queryParams.append('month', String(params.month));
      if (params.year) queryParams.append('year', String(params.year));
      if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
    }
    return fetchApi<{ success: boolean; grandTotal: number; data: { _id: string; totalAmount: number; count: number }[] }>(endpoint);
  },

  // Get single expense
  getById: async (id: string) => {
    return fetchApi<ApiResponse<Expense>>(`/expenses/${id}`);
  },

  // Create expense
  create: async (data: CreateExpenseDTO) => {
    return fetchApi<ApiResponse<Expense>>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update expense
  update: async (id: string, data: Partial<CreateExpenseDTO>) => {
    return fetchApi<ApiResponse<Expense>>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete expense
  delete: async (id: string) => {
    return fetchApi<ApiResponse<null>>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ UPLOAD API ============
export const uploadApi = {
  // Upload image
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const url = `${API_BASE_URL}/upload/image`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل في رفع الصورة');
    }
    
    return data as { success: boolean; url: string };
  },
};

// Health check
export const healthCheck = async () => {
  return fetchApi<{ success: boolean; message: string; timestamp: string }>('/health');
};
