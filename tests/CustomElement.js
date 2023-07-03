import { attachRealm, reconcile } from '../src/index.js';

export class CustomElement extends HTMLElement {
    constructor() {
        super();

        this.realm = attachRealm(this);
        this.realm.observe(() => this.forceUpdate());
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
            Array.from(childNodes).filter(
                (node) => !(node instanceof HTMLElement) || node.getAttribute('slot') === null
            )
        );
        reconcile(
            div,
            Array.from(childNodes).filter(
                (node) => node instanceof HTMLElement && node.getAttribute('slot') === 'children'
            )
        );

        let p = root.childNodes[2];
        if (this.prop) {
            if (!p || p.tagName !== 'P') {
                p = this.ownerDocument.createElement('p');
                root.insertBefore(p, root.childNodes[2]);
            }
            p.textContent = this.prop;
        } else if (p && p.tagName === 'P') {
            root.removeChild(p);
        }

        let pre = root.childNodes[3] || root.childNodes[2];
        if (this.ref) {
            if (!pre || pre.tagName !== 'PRE') {
                pre = this.ownerDocument.createElement('pre');
                root.appendChild(pre);
            }
            p.textContent = this.ref.title;
        } else if (pre && pre.tagName === 'PRE') {
            root.removeChild(pre);
        }
    }
}

customElements.define('custom-element', CustomElement);
