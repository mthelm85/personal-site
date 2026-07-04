import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		include: ['mathjs']
	},
	resolve: {
		dedupe: ['three']
	},
	ssr: {
		noExternal: ['three', '@threlte/core', '@threlte/extras']
	}
});
