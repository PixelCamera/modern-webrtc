import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { UserConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const config: UserConfig = {
  plugins: [react()] as UserConfig['plugins'],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}

export default defineConfig(config)
