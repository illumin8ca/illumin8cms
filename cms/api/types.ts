export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  STRIPE_SECRET: string;
  JWT_SECRET: string;
  CONTACT_EMAIL: string;
  MAILCHANNELS_DOMAIN: string;
  MAILCHANNELS_PRIVATE_KEY: string;
} 