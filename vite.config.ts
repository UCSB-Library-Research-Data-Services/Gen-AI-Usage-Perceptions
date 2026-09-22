import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Served from https://<org>.github.io/Gen-AI-Usage-Perceptions/, so assets need this base path.
  base: '/Gen-AI-Usage-Perceptions/',
})

