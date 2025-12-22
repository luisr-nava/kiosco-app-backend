import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  DATABASE_URL: string;
  AUTH_SERVICE_URL: string;
  PORT: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  ALLOWED_ORIGINS: string;
}

const logger = new Logger('Kiosco - error');

const envVarsSchema = joi
  .object({
    DATABASE_URL: joi.string().required(),
    AUTH_SERVICE_URL: joi.string().required(),
    PORT: joi.string().required(),
    JWT_SECRET: joi.string().min(32).required().messages({
      'string.min':
        'JWT_SECRET debe tener al menos 32 caracteres para seguridad',
    }),
    NODE_ENV: joi
      .string()
      .valid('development', 'production')
      .default('development'),
    ALLOWED_ORIGINS: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
  logger.error(`❌ Error en las variables de entorno: ${error.message}`);
  throw new Error(`❌ Error en las variables de entorno: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  dbUrl: envVars.DATABASE_URL,
  authServiceUrl: envVars.AUTH_SERVICE_URL,
  jwtSecret: envVars.JWT_SECRET,
  nodeEnv: envVars.NODE_ENV,
  allowedOrigins: envVars.ALLOWED_ORIGINS,
};
