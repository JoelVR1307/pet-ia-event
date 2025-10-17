import api from './api.service';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';

export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    this.setToken(response.data.access_token);
    this.setUser(response.data.user);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.access_token);
    this.setUser(response.data.user);
    return response.data;
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async validateToken(): Promise<boolean> {
    try {
      await api.get('/auth/validate');
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();