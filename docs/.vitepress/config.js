import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Quantum',
    description: 'Custom elements composition made easy',
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
                    { text: 'Features', link: '/guide/features' },
                    { text: 'Getting started', link: '/guide/' },
                    { text: 'Usage', link: '/guide/usage' },
                    { text: 'Custom Elements', link: '/guide/custom-elements' },
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
