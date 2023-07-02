import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
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
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            customProviderModule: '@vitest/coverage-v8',
        },
    },
});
