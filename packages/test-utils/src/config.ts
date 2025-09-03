import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from root .env file
config({ path: join(__dirname, '../../../.env') });

export const testConfig = {
  baseUrls: {
    webAdmin: process.env.WEB_ADMIN_URL || 'http://localhost:3000',
    webIdp: process.env.WEB_IDP_URL || 'http://localhost:3001',
    webInvestor: process.env.WEB_INVESTOR_URL || 'http://localhost:3002',
    apiBackend: process.env.API_BACKEND_URL || 'http://localhost:4000',
    apiIdp: process.env.API_IDP_URL || 'http://localhost:4001',
  },
  testUsers: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'password123',
    },
    investor: {
      email: process.env.TEST_INVESTOR_EMAIL || 'investor@test.com',
      password: process.env.TEST_INVESTOR_PASSWORD || 'password123',
    },
    user: {
      email: process.env.TEST_USER_EMAIL || 'user@test.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
    },
  },
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    extraLong: 60000,
  },
  headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
};
