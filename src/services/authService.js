import axios from 'axios';

// Singleton service to manage auth state in memory
class AuthService {
  constructor() {
    this.refreshTimer = null;
  }

  setTokens(accessToken, refreshToken, tokenType = 'Bearer') {
    if (!accessToken) {
      console.error('No access token provided');
      return;
    }

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_type', tokenType);

    // Setup refresh timer
    this.setupRefreshTimer();
  }

  getTokens() {
    return {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
      tokenType: localStorage.getItem('token_type')
    };
  }

  isAuthenticated() {
    const { accessToken } = this.getTokens();
    return !!accessToken && !this.isTokenExpired(accessToken);
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }

  getTokenExpirationTime(token) {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  isTokenExpired(token) {
    const expTime = this.getTokenExpirationTime(token);
    if (!expTime) return true;
    return Date.now() >= expTime;
  }

  setupRefreshTimer() {
    const { accessToken } = this.getTokens();
    const expTime = this.getTokenExpirationTime(accessToken);
    
    if (!expTime) return;

    const timeUntilRefresh = expTime - Date.now() - (60 * 1000); // Refresh 1 minute before expiration
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(async () => {
      await this.refreshAccessToken();
    }, timeUntilRefresh);
  }

  async refreshAccessToken() {
    try {
      const { refreshToken } = this.getTokens();
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post('/auth/refresh', { refresh_token: refreshToken });
      const { access_token, refresh_token } = response.data;
      
      this.setTokens(access_token, refresh_token);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      window.dispatchEvent(new Event('auth-error'));
      return false;
    }
  }
}

export const authService = new AuthService(); 