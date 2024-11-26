import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  // React 支持
  plugins: [react()],

  // 开发服务器配置
  server: {
    // 监听所有网络接口
    host: '0.0.0.0',
    // 开发服务器端口
    port: 5173,
    // HTTPS 配置
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../server/cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../server/cert/cert.pem')),
    },
    // 热更新配置
    hmr: {
      host: '192.168.2.36',
      protocol: 'wss'
    }
  },

  // 路径解析配置
  resolve: {
    alias: {
      // src 目录别名
      '@': path.resolve(__dirname, './src')
    },
  },
})
