import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Quantum',
    description: 'Custom elements composition made easy.',
    base: '/quantum/',
    outDir: '../public',

    head: [['link', { rel: 'icon', href: '/quantum/favicon.png' }]],

    themeConfig: {
        logo: '/chialab.svg',

        editLink: {
            pattern: 'https://github.com/chialab/quantum/edit/main/docs/:path',
            text: 'Suggest changes to this page',
        },

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
            {
                text: 'Ecosystem',
                items: [
                    { text: 'DNA', link: 'https://chialab.github.io/dna/' },
                    { text: 'Plasma', link: 'https://chialab.github.io/plasma/' },
                    { text: 'Loock', link: 'https://chialab.github.io/loock/' },
                    { text: 'Synapse', link: 'https://github.com/chialab/synapse/' },
                ],
            },
            {
                text: 'Chialab Open Source',
                link: 'https://www.chialab.io',
            },
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Why Quantum', link: '/guide/why-quantum' },
                    { text: 'Features', link: '/guide/features' },
                    { text: 'Get started', link: '/guide/' },
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
