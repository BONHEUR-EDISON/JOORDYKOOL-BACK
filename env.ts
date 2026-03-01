// apps/api/env.ts
import * as dotenv from 'dotenv';

dotenv.config(); // 🔑 DOIT être le tout premier import avant tout
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 3000;
