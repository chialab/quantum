import { h, render } from 'preact';
import { bench, describe } from 'vitest';

describe('prototype', () => {
    bench('native', async () => {
        const container = document.createElement('div');
        const items = Array.from({ length: 1000 }, (_, i) => i);
        render(
            h(
                'ul',
                null,
                items.map((item) => h('li', null, item))
            ),
            container
        );
        render(h('ul', null, []), container);
    });

    bench('quantum', async () => {
        const { attachRealm } = await import('../src/index.js');
        const container = document.createElement('div');
        const items = Array.from({ length: 1000 }, (_, i) => i);

        attachRealm(container);
        render(
            h(
                'ul',
                null,
                items.map((item) => h('li', null, item))
            ),
            container
        );
        render(h('ul', null, []), container);
    });
});
