/* istanbul ignore file */
import dotenv from 'dotenv';
import Joi, { ValidationError } from '@hapi/joi';
import { logger } from '../utils/pinoLogger';

import { Environment, ConfigType } from './types';
import { defaultConfig } from './default';

const log = logger(__filename);
dotenv.config();

// TODO: validate CUSTOMER_CONFIGS stringified JSON using JOI
let CUSTOMER_CONFIGS = [];
try {
  const customerConfigsStr = process.env.CUSTOMER_CONFIGS;
  CUSTOMER_CONFIGS = JSON.parse(customerConfigsStr);

  for (const config of CUSTOMER_CONFIGS) {
    const keys = Object.keys(config);
    if (
      !keys.includes('OPENAI_API_KEY') ||
      !keys.includes('OPENAI_ORG') ||
      !keys.includes('OPENAI_ASSISTANT_ID') ||
      !keys.includes('x-customer-id') ||
      !keys.includes('x-api-key')
    ) {
      throw Error(
        'Invalid customer config, must include OPENAI_API_KEY, OPENAI_ORG, OPENAI_ASSISTANT_ID, x-customer-id, x-api-key',
      );
    }
  }
} catch (err) {
  if (err) {
    log.error({
      action: 'config validation',
      result: 'failure',
      e: err.stack,
    });
    process.exit(1);
  }
}

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(Environment))
    .default(defaultConfig.NODE_ENV),

  SERVER_PORT: Joi.number().default(defaultConfig.SERVER_PORT),

  POSTGRESQL_CONNECTION_STRING: Joi.string().required(),
});

const {
  error,
  value: config,
}: {
  error?: ValidationError;
  value: ConfigType;
} = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

if (error) {
  error.details.forEach((d: any) => log.error(d.message));
  process.exit(1);
}

config.CUSTOMER_CONFIGS = CUSTOMER_CONFIGS;

export { config };
