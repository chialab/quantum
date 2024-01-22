import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [svelte()],
    build: {
        minify: true,
        lib: {
            entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
            name: 'Quantum',
            fileName: 'quantum',
            formats: ['es'],
        },
    },
    test: {
        browser: {
            name: 'chrome',
            enabled: true,
            headless: true,
        },
        coverage: {
            provider: 'istanbul',
            include: ['src'],
        },
    },
});
