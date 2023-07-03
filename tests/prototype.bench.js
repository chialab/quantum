/* eslint-disable mocha/no-setup-in-describe */

import { html } from 'htm/preact';
import { render } from 'preact';
import { bench, describe } from 'vitest';

describe('prototype', () => {
    bench('native', async () => {
        const container = document.createElement('div');
        const items = Array.from({ length: 1000 }, (_, i) => i);
        render(
            html`<ul>
                ${items.map((item) => html`<li>${item}</li>`)}
            </ul>`,
            container
        );
        render(html`<ul></ul>`, container);
    });

    bench('quantum', async () => {
        const { attachRealm } = await import('../src/index.js');
        const container = document.createElement('div');
        const items = Array.from({ length: 1000 }, (_, i) => i);

        attachRealm(container);
        render(
            html`<ul>
                ${items.map((item) => html`<li>${item}</li>`)}
            </ul>`,
            container
        );
        render(html`<ul></ul>`, container);
    });
});
