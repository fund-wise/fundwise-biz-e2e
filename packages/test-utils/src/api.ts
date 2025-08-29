import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { testConfig } from './config';
import { AuthHelper, User } from './auth';

export class ApiClient {
  private client: AxiosInstance;
  private accessToken?: string;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: testConfig.timeouts.medium,
    });

    // Add request interceptor to include auth header
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  async authenticate(user: User): Promise<void> {
    const tokens = await AuthHelper.login(user);
    this.accessToken = tokens.accessToken;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const createBackendApiClient = (): ApiClient => {
  return new ApiClient(testConfig.baseUrls.apiBackend);
};

export const createIdpApiClient = (): ApiClient => {
  return new ApiClient(testConfig.baseUrls.apiIdp);
};
