import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    hmr: true,
    port: 5002, // 前端端口
    proxy: {
      '/api': {
        //http://localhost:9091
        target: 'https://arkedu.tech', // 后端服务地址
        changeOrigin: true,  // 更改来源，避免跨域问题
      },
    }
  },
  base: '/',
})
