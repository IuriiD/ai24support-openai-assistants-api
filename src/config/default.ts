import { Environment, ConfigType } from './types';

export const defaultConfig: ConfigType = {
  NODE_ENV: Environment.development,
  SERVER_PORT: 3000,
  CUSTOMER_CONFIGS: [],
  POSTGRESQL_CONNECTION_STRING: '',
};
