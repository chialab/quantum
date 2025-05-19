import { createNodeList } from './NodeList.js';
import { getParentRealm, getRealm, normalizeNode } from './Realm.js';
import { defineProperty, getOwnPropertyDescriptors } from './utils.js';

/**
 * Extends the Node prototype with realm aware methods.
 * @param {typeof Node} Node The Node constructor to extend.
 */
export function extendNode(Node) {
    const NodePrototype = Node.prototype;
    const {
        appendChild,
        removeChild,
        replaceChild,
        insertBefore,
        childNodes,
        hasChildNodes,
        firstChild,
        lastChild,
        parentNode,
        parentElement,
        previousSibling,
        nextSibling,
        contains,
        nodeValue,
        textContent,
    } = getOwnPropertyDescriptors(NodePrototype);

    defineProperty(NodePrototype, 'appendChild', {
        /**
         * @this {Node}
         * @param {ChildNode} node
         */
        value(node) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (appendChild).value.call(
                    normalizeNode(this),
                    normalizeNode(node)
                );
            }
            return realm.append(node)[0];
        },
    });

    defineProperty(NodePrototype, 'removeChild', {
        /**
         * @this {Node}
         * @param {ChildNode} node
         */
        value(node) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (removeChild).value.call(
                    normalizeNode(this),
                    normalizeNode(node)
                );
            }
            return realm.remove(node)[0];
        },
    });

    defineProperty(NodePrototype, 'replaceChild', {
        /**
         * @this {Node}
         * @param {ChildNode} node
         * @param {ChildNode} child
         */
        value(node, child) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (replaceChild).value.call(
                    normalizeNode(this),
                    normalizeNode(node),
                    normalizeNode(child)
                );
            }
            return realm.replaceWith(child, node)[0];
        },
    });

    defineProperty(NodePrototype, 'insertBefore', {
        /**
         * @this {Node}
         * @param {ChildNode} node
         * @param {ChildNode | null} child
         */
        value(node, child) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (insertBefore).value.call(
                    normalizeNode(this),
                    normalizeNode(node),
                    normalizeNode(child)
                );
            }
            return realm.insertBefore(child, node)[0];
        },
    });

    defineProperty(NodePrototype, 'hasChildNodes', {
        /**
         * @this {Node}
         */
        value() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (hasChildNodes).value.call(
                    normalizeNode(this)
                );
            }
            return !!realm.getChildren().length;
        },
    });

    defineProperty(NodePrototype, 'contains', {
        /**
         * @this {Node}
         * @param {Node | null | undefined} node
         */
        value(node) {
            if (node == null) {
                return false;
            }
            return /** @type {import('./utils.js').ValueDescriptor} */ (contains).value.call(
                normalizeNode(this),
                normalizeNode(node)
            );
        },
    });

    defineProperty(NodePrototype, 'childNodes', {
        /**
         * @this {Node}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').GetterDescriptor} */ (childNodes).get.call(normalizeNode(this));
            }
            return createNodeList(realm.getChildren());
        },
        set: childNodes.set,
    });

    defineProperty(NodePrototype, 'firstChild', {
        /**
         * @this {Node}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (firstChild).get.call(normalizeNode(this)) ??
                    null
                );
            }
            return realm.getFirstChild();
        },
        set: firstChild.set,
    });

    defineProperty(NodePrototype, 'lastChild', {
        /**
         * @this {Node}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (lastChild).get.call(normalizeNode(this)) ??
                    null
                );
            }
            return realm.getLastChild();
        },
        set: lastChild.set,
    });

    defineProperty(NodePrototype, 'parentNode', {
        /**
         * @this {Node}
         */
        get() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (parentNode).get.call(normalizeNode(this)) ??
                    null
                );
            }
            return parentRealm.node;
        },
        set: parentNode.set,
    });

    defineProperty(NodePrototype, 'parentElement', {
        /**
         * @this {Node}
         */
        get() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (parentElement).get.call(
                        normalizeNode(this)
                    ) ?? null
                );
            }
            return parentRealm.node;
        },
        set: parentElement.set,
    });

    defineProperty(NodePrototype, 'previousSibling', {
        /**
         * @this {ChildNode}
         */
        get() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (previousSibling).get.call(
                        normalizeNode(this)
                    ) ?? null
                );
            }
            return parentRealm.getPreviousSibling(this);
        },
        set: previousSibling.set,
    });

    defineProperty(NodePrototype, 'nextSibling', {
        /**
         * @this {ChildNode}
         */
        get() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (nextSibling).get.call(normalizeNode(this)) ??
                    null
                );
            }
            return parentRealm.getNextSibling(this);
        },
        set: nextSibling.set,
    });

    defineProperty(NodePrototype, 'nodeValue', {
        /**
         * @this {Node}
         */
        get() {
            return (
                /** @type {import('./utils.js').GetterDescriptor} */ (nodeValue).get.call(normalizeNode(this)) ?? null
            );
        },

        /**
         * @this {Node}
         * @param {string} value
         */
        set(value) {
            /** @type {import('./utils.js').SetterDescriptor} */ (textContent).set.call(normalizeNode(this), value);
        },
    });

    defineProperty(NodePrototype, 'textContent', {
        /**
         * @this {Node}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (textContent).get.call(normalizeNode(this)) ??
                    null
                );
            }
            return realm.getTextContent() ?? null;
        },
        /**
         * @this {Node}
         * @param {string} value
         */
        set(value) {
            const setter = /** @type {import('./utils.js').SetterDescriptor} */ (textContent).set.bind(
                normalizeNode(this)
            );
            if (this.nodeType === 1 /* ELEMENT_NODE */) {
                const realm = getRealm(this);
                if (realm) {
                    for (const child of this.childNodes) {
                        this.removeChild(child);
                    }
                    setter(value);
                    realm.initialize();
                    return;
                }
            }
            setter(value);
        },
    });
}
