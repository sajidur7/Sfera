import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

// StyleX compiles every stylex.create / defineVars call at build time.
export default defineConfig({
  plugins: [stylex.vite({ useCSSLayers: true, unstable_moduleResolution: { type: 'commonJS' } }), react()],
});
