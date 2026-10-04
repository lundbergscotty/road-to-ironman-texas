import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match the GitHub repo name for GitHub Pages:
// https://lundbergscotty.github.io/road-to-ironman-texas/
export default defineConfig({
  plugins: [react()],
  base: '/road-to-ironman-texas/',
})
