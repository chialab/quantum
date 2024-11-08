import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [svelte(), svelteTesting()],
    test: {
        browser: {
            provider: 'webdriverio',
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
