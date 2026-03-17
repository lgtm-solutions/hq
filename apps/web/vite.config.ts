import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  console.log(`Starting in ${mode} mode`)
  return {
    plugins: [tailwindcss(), sveltekit()],
    envDir: '../../',
  };
});
