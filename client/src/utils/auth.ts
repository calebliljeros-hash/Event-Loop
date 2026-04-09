import { jwtDecode } from 'jwt-decode';

interface UserToken {
  data: {
    _id: string;
    username: string;
    email: string;
  };
  exp: number;
}

class AuthService {
  getProfile(): UserToken['data'] | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.data;
    } catch {
      return null;
    }
  }

  loggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('id_token');
  }

  login(idToken: string): void {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/dashboard');
  }

  logout(): void {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();
