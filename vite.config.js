import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose all environment variables to the client
      'import.meta.env': JSON.stringify(env),
      // Expose specific environment variables
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        ...Object.fromEntries(
          Object.entries(process.env)
            .filter(([key]) => key.startsWith('FIREBASE_') || key.startsWith('VITE_'))
            .map(([key, value]) => [key, JSON.stringify(value)])
        )
      }
    },
    server: {
      port: 5143,
      open: true
    }
  };
});