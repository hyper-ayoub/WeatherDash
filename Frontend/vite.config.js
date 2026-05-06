import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

const mersenneTwisterShim = fileURLToPath(new URL('./src/shims/mersenne-twister.js', import.meta.url))
const urijsShim = fileURLToPath(new URL('./src/shims/urijs.js', import.meta.url))
const graphemeShim = fileURLToPath(new URL('./src/shims/grapheme-splitter.js', import.meta.url))
const bitmapSdfShim = fileURLToPath(new URL('./src/shims/bitmap-sdf.js', import.meta.url))
const lercShim = fileURLToPath(new URL('./src/shims/lerc.js', import.meta.url))
const nosleepShim = fileURLToPath(new URL('./src/shims/nosleep.js', import.meta.url))

export default defineConfig({
  plugins: [react(), cesium()],
  resolve: {
    alias: {
      'mersenne-twister': mersenneTwisterShim,
      'urijs': urijsShim,
      'grapheme-splitter': graphemeShim,
      'bitmap-sdf': bitmapSdfShim,
      'lerc': lercShim,
      'nosleep.js': nosleepShim,
    },
  },
  optimizeDeps: {
    exclude: ['cesium'],
    include: ['urijs', 'grapheme-splitter', 'bitmap-sdf', 'lerc', 'nosleep.js'],
  },
  server: {
    watch: {
      usePolling: true
    }
  }
})