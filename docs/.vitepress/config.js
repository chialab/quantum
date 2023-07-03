import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Quantum DOM',
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
                link: '/guide/get-started',
            },
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Why Quantum', link: '/guide/why-quantum' },
                    { text: 'Get started', link: '/guide/get-started' },
                    { text: 'Features', link: '/guide/features' },
                    { text: 'Usage', link: '/guide/usage' },
                    { text: 'Web Components', link: '/guide/web-components' },
                ],
            },
            {
                text: 'Frameworks',
                items: [
                    { text: 'Overview', link: '/guide/frameworks' },
                    { text: 'Lit', link: '/guide/frameworks/lit' },
                    { text: 'Peact', link: '/guide/frameworks/preact' },
                    { text: 'React', link: '/guide/frameworks/react' },
                    { text: 'Svelte', link: '/guide/frameworks/svelte' },
                    { text: 'Vue', link: '/guide/frameworks/vue' },
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
            copyright: 'Copyright © 2023 - Chialab',
        },
    },
});
