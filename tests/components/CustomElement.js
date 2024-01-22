import { html, render } from 'uhtml';
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
        render(
            this.realm.root,
            html`
                <span>${this.realm.childNodesBySlot(null)}</span><div>${this.realm.childNodesBySlot('children')}</div>
            `
        );
    }
}

customElements.define('custom-element', CustomElement);
