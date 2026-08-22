import { apiRequest, setStoredToken, getStoredToken } from './apiClient';
import { User } from '../types';
import { getStoredUser, saveStoredUser, saveAdminAuth } from './storage';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  // Devotee User Profile
  async getCurrentUser(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const user = await apiRequest<User>('/auth/me');
      if (user) {
        saveStoredUser(user);
        return user;
      }
    } catch {
      setStoredToken(null);
      saveStoredUser(null);
      saveAdminAuth(false);
    }
    return null;
  },

  async loginUser(email: string, password?: string): Promise<User> {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'devotee123' }),
    });

    if (response.access_token) {
      setStoredToken(response.access_token);
    }
    if (response.user) {
      saveStoredUser(response.user);
      saveAdminAuth(response.user.role === 'admin' || response.user.role === 'superadmin');
      return response.user;
    }
    throw new Error('Login failed: Invalid server response');
  },

  async registerUser(name: string, email: string, whatsapp?: string, password?: string): Promise<User> {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, whatsapp, password: password || 'devotee123' }),
    });

    if (response.access_token) {
      setStoredToken(response.access_token);
    }
    if (response.user) {
      saveStoredUser(response.user);
      saveAdminAuth(false);
      return response.user;
    }
    throw new Error('Registration failed: Invalid server response');
  },

  async logoutUser(): Promise<void> {
    setStoredToken(null);
    saveStoredUser(null);
    saveAdminAuth(false);
  },

  // Protected Admin Portal
  async isAdminAuthenticated(): Promise<boolean> {
    const token = getStoredToken();
    if (!token) return false;
    try {
      const adminUser = await apiRequest<User>('/auth/admin/me');
      return Boolean(adminUser && (adminUser.role === 'admin' || adminUser.role === 'superadmin'));
    } catch {
      return false;
    }
  },

  async loginAdmin(email: string, password?: string): Promise<User> {
    // Strictly require backend API verification. NO client fallback bypass.
    const response = await apiRequest<AuthResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || '' }),
    });

    if (response.access_token && response.user) {
      if (response.user.role !== 'admin' && response.user.role !== 'superadmin') {
        throw new Error('Access denied: You do not have administrative privileges.');
      }
      setStoredToken(response.access_token);
      saveAdminAuth(true);
      saveStoredUser(response.user);
      return response.user;
    }

    throw new Error('Invalid administrative credentials');
  },

  async logoutAdmin(): Promise<void> {
    setStoredToken(null);
    saveAdminAuth(false);
    saveStoredUser(null);
  },
};