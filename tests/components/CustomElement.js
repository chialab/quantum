import { attachRealm, reconcile } from '../../src/index.js';

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
        const { root, childNodesAsArray } = this.realm;

        let span = root.childNodes[0];
        let div = root.childNodes[1];
        if (!span) {
            span = this.ownerDocument.createElement('span');
            root.appendChild(span);
        }
        if (!div) {
            div = this.ownerDocument.createElement('div');
            root.appendChild(div);
        }

        reconcile(
            span,
            childNodesAsArray.filter((node) => !(node instanceof HTMLElement) || node.getAttribute('slot') === null)
        );
        reconcile(
            div,
            childNodesAsArray.filter((node) => node instanceof HTMLElement && node.getAttribute('slot') === 'children')
        );
    }
}

customElements.define('custom-element', CustomElement);
