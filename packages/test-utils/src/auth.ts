import axios from 'axios';
import { testConfig } from './config';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  email: string;
  password: string;
}

export class AuthHelper {
  private static tokenCache = new Map<string, AuthTokens>();

  static async login(user: User): Promise<AuthTokens> {
    const cacheKey = `${user.email}:${user.password}`;

    if (this.tokenCache.has(cacheKey)) {
      return this.tokenCache.get(cacheKey)!;
    }

    try {
      const response = await axios.post(`${testConfig.baseUrls.apiIdp}/auth/login`, {
        email: user.email,
        password: user.password,
      });

      const tokens: AuthTokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };

      this.tokenCache.set(cacheKey, tokens);
      return tokens;
    } catch (error) {
      throw new Error(`Login failed for ${user.email}: ${error}`);
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      await axios.post(`${testConfig.baseUrls.apiIdp}/auth/logout`, {
        refreshToken,
      });

      // Clear token from cache
      for (const [key, tokens] of this.tokenCache.entries()) {
        if (tokens.refreshToken === refreshToken) {
          this.tokenCache.delete(key);
          break;
        }
      }
    } catch (error) {
      throw new Error(`Logout failed: ${error}`);
    }
  }

  static clearTokenCache(): void {
    this.tokenCache.clear();
  }
}
