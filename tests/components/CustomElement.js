import { attachRealm } from '../../src/index.js';

/**
 * Reconcile root children.
 * @param {HTMLElement} root The root element.
 * @param {ChildNode[]} nodes The nodes to reconcile.
 */
function reconcile(root, nodes) {
    const children = root.childNodes;
    const length = nodes.length;

    let currentNode = children.item(0);
    for (let i = 0; i < length; i++) {
        const node = nodes[i];
        if (currentNode !== node) {
            root.insertBefore(node, currentNode);
        } else {
            currentNode = children.item(i + 1);
        }
    }

    while (children.length > length) {
        root.removeChild(/** @type {Node} */ (root.lastChild));
    }
}

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
            childNodes.filter((node) => !(node instanceof HTMLElement) || node.getAttribute('slot') === null)
        );
        reconcile(
            div,
            childNodes.filter((node) => node instanceof HTMLElement && node.getAttribute('slot') === 'children')
        );
    }
}

customElements.define('custom-element', CustomElement);
