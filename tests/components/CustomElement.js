import { render, html } from 'uhtml';
import { attachRealm } from '../../src/index.js';

export class CustomElement extends HTMLElement {
    constructor() {
        super();

        this.realm = attachRealm(this);
        this.realm.observe(() => this.forceUpdate());
    }

    connectedCallback() {
        this.realm.requestUpdate(() => this.forceUpdate());
    }

    forceUpdate() {
        const { root, childNodes } = this.realm;

        render(
            root,
            html`
                <span>${childNodes.filter((node) => node.nodeType !== 1 || node.getAttribute('slot') === null)}</span
                ><div
                    >${childNodes.filter(
                        (node) => node.nodeType === 1 && node.getAttribute('slot') === 'children'
                    )}</div
                >
            `
        );
    }
}

customElements.define('custom-element', CustomElement);
