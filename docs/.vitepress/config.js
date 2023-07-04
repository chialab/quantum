import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Quantum',
    description: 'A light DOM implementation of the `<slot>` element to be used across frameworks.',
    themeConfig: {
        logo: 'https://raw.githubusercontent.com/chialab/dna/main/logo.svg',

        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {
                text: 'Home',
                link: '/',
            },
            {
                text: 'Guide',
                link: '/guide/',
            },
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Why Quantum', link: '/guide/why-quantum' },
                    { text: 'Getting started', link: '/guide/' },
                    { text: 'Usage', link: '/guide/usage' },
                    { text: 'Features', link: '/guide/features' },
                    { text: 'Web Components', link: '/guide/web-components' },
                    { text: 'Frameworks', link: '/guide/frameworks' },
                ],
            },
        ],

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/chialab/quantum',
            },
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2023 - DNA project - Chialab',
        },
    },
    lastUpdated: true,
});
