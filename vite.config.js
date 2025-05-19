import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        svelte(),
        svelteTesting({
            resolveBrowser: false,
        }),
    ],
    test: {
        browser: {
            provider: 'webdriverio',
            enabled: true,
            headless: true,
            instances: [{ browser: 'chrome' }],
        },
        coverage: {
            provider: 'istanbul',
            include: ['src'],
        },
    },
});
