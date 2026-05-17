/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.{ts,js}'],
      exclude: ['src/lib/**/*.test.{ts,js}', 'src/lib/**/*.svelte.ts'],
      reporter: ['text', 'json', 'json-summary', 'html']
    }
  }
});
