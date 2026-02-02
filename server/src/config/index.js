import * as yup from "yup";
import dotenv from 'dotenv';

dotenv.config();

const envSchema = yup.object({
  NODE_ENV: yup.enum(['development', 'production', 'test']),
  PORT: yup.string().transform(Number),
  DATABASE_URL: yup.string().url(),
  JWT: yup.string().min(32),
});

export const config = envSchema.parse(process.env);