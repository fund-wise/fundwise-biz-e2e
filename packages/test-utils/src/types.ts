export interface TestUser {
  email: string;
  password: string;
}

export interface TestEnvironment {
  name: string;
  baseUrls: {
    webAdmin: string;
    webIdp: string;
    webInvestor: string;
    apiBackend: string;
    apiIdp: string;
  };
}

export interface TestResult {
  passed: boolean;
  message?: string;
  duration?: number;
}
