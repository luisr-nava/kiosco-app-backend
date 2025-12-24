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
  MAIL_HOST?: string;
  MAIL_PORT?: string;
  MAIL_USER?: string;
  MAIL_PASSWORD?: string;
  MAIL_SECURE?: string;
  REPORTS_NOTIFICATION_EMAIL?: string;
  REPORTS_FROM_EMAIL?: string;
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
    MAIL_HOST: joi.string().allow('', null),
    MAIL_PORT: joi.string().allow('', null),
    MAIL_USER: joi.string().allow('', null),
    MAIL_PASSWORD: joi.string().allow('', null),
    MAIL_SECURE: joi.string().valid('true', 'false').allow('', null),
    REPORTS_NOTIFICATION_EMAIL: joi.string().email().allow('', null),
    REPORTS_FROM_EMAIL: joi.string().email().allow('', null),
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
  mailHost: envVars.MAIL_HOST,
  mailPort: envVars.MAIL_PORT,
  mailUser: envVars.MAIL_USER,
  mailPassword: envVars.MAIL_PASSWORD,
  mailSecure: envVars.MAIL_SECURE,
  reportsNotificationEmail: envVars.REPORTS_NOTIFICATION_EMAIL,
  reportsFromEmail: envVars.REPORTS_FROM_EMAIL,
};
