import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [svelte()],
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
