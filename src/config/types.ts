export enum Environment {
  development = 'development',
  staging = 'staging',
  testing = 'testing',
  production = 'production',
  test = 'test',
}

export type CustomerConfig = {
  OPENAI_API_KEY: string;
  OPENAI_ORG: string;
  OPENAI_ASSISTANT_ID: string;
  'x-customer-id': string;
  'x-api-key': string;
};

export type ConfigType = {
  NODE_ENV: Environment;
  SERVER_PORT: number;
  CUSTOMER_CONFIGS: CustomerConfig[];
  POSTGRESQL_CONNECTION_STRING: string;
};
