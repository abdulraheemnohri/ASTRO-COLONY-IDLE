import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

type VitestConfig = UserConfig & {
  test: {
    environment: string;
    globals: boolean;
  };
};

const config: VitestConfig = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
};

export default defineConfig(config);
