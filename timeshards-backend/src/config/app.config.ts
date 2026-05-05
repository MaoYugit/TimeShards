import { registerAs } from "@nestjs/config";
import * as Joi from "joi";

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  adminUsername: string;
  adminPassword: string;
  corsOrigins: string[];
  logLevel: string;
}

export const appConfig = registerAs(
  "app",
  (): AppConfig => ({
    port: parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    mongodbUri: process.env.MONGODB_URI || "",
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    adminUsername: process.env.ADMIN_USERNAME || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
    logLevel: process.env.LOG_LEVEL || "info",
  }),
);

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  MONGODB_URI: Joi.string().required().messages({
    "any.required": "MONGODB_URI is required",
    "string.empty": "MONGODB_URI cannot be empty",
  }),
  JWT_SECRET: Joi.string().min(16).required().messages({
    "any.required": "JWT_SECRET is required",
    "string.min": "JWT_SECRET must be at least 16 characters long",
  }),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  ADMIN_USERNAME: Joi.string().required().messages({
    "any.required": "ADMIN_USERNAME is required",
  }),
  ADMIN_PASSWORD: Joi.string().min(6).required().messages({
    "any.required": "ADMIN_PASSWORD is required",
    "string.min": "ADMIN_PASSWORD must be at least 6 characters long",
  }),
  CORS_ORIGINS: Joi.string().required().messages({
    "any.required": "CORS_ORIGINS is required",
  }),
  LOG_LEVEL: Joi.string()
    .valid("fatal", "error", "warn", "info", "debug", "trace", "silent")
    .default("info"),
});
