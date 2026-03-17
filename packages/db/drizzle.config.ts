import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: DATABASE_URL!,
  },
});
