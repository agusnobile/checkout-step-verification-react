import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración optimizada como sugiere el documento de arquitectura
export default defineConfig({
  plugins: [react()],
  
  // Optimización de build
  build: {
    // Mejorar el bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React en su propio chunk
          'react-vendor': ['react', 'react-dom'],
          
          // Separar react-router en su propio chunk
          'router': ['react-router-dom'],
          
          // Separar componentes grandes
          'captcha': ['react-google-recaptcha'],
        }
      }
    },
    
    // Comprimir assets
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true
      }
    },
    
    // Tamaño máximo de chunk recomendado por el documento
    chunkSizeWarningLimit: 100, // 100KB warning
  },
  
  // Optimización de desarrollo
  server: {
    host: true, // Para poder acceder desde otros dispositivos
    port: 5174,
    
    // Proxy para el backend (facilita desarrollo local)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    // Nota: permitimos que Vite optimice react-google-recaptcha para evitar errores de importación dinámicos
    // (el problema de "prop-types" sin export default se soluciona dejando que Vite lo convierta a ESM)
    // exclude: ['react-google-recaptcha']
  },
  
  // CSS configuration - usando postcss.config.js por defecto
  
  // Preload de módulos críticos
  experimental: {
    renderBuiltUrl(filename: string) {
      // Preload críticos, lazy load no críticos
      if (filename.includes('captcha')) {
        return { runtime: `__import.meta.url__` };
      }
      return { relative: true };
    }
  }
})
