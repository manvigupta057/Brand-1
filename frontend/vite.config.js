import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      'components': path.resolve(__dirname, './src/components'),
      'views': path.resolve(__dirname, './src/views'),
      'layouts': path.resolve(__dirname, './src/layouts'),
      'variables': path.resolve(__dirname, './src/variables'),
      'assets': path.resolve(__dirname, './src/assets'),
      'routes.js': path.resolve(__dirname, './src/routes.js'),
    }
  }
})
