/* eslint-disable mocha/no-setup-in-describe */

import { html } from 'htm/preact';
import { render } from 'preact';
import { bench, describe } from 'vitest';
import { attachRealm } from '../src/index.js';

describe('prototype', () => {
    bench('native', () => {
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

    bench('quantum', () => {
        const container = document.createElement('div');
        attachRealm(container);

        const items = Array.from({ length: 1000 }, (_, i) => i);
        render(
            html`<ul>
                ${items.map((item) => html`<li>${item}</li>`)}
            </ul>`,
            container
        );
        render(html`<ul></ul>`, container);
    });
});
