import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
    plugins: [svelte(), svelteTesting()],
    resolve: {
        conditions: ['browser'],
    },
    test: {
        browser: {
            enabled: true,
            headless: true,
            provider: 'webdriverio',
            instances: [
                {
                    browser: 'chrome',
                },
            ],
        },
        coverage: {
            provider: 'istanbul',
            include: ['src'],
        },
    },
});

export default config;
