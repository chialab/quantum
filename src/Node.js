import { createNodeList } from './NodeList.js';
import { getRealm, getParentRealm } from './Realm.js';
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
    } = getOwnPropertyDescriptors(NodePrototype);

    defineProperty(NodePrototype, 'appendChild', {
        /**
         * @this {Node}
         * @param {ChildNode} node
         */
        value(node) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (appendChild).value.call(this, node);
            }
            return realm.append(node);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (removeChild).value.call(this, node);
            }
            return realm.remove(node);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (replaceChild).value.call(this, node, child);
            }
            return realm.replaceWith(child, node);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (insertBefore).value.call(this, node, child);
            }
            realm.insertBefore(child, node);
            return node;
        },
    });

    defineProperty(NodePrototype, 'childNodes', {
        /**
         * @this {Node}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').GetterDescriptor} */ (childNodes).get.call(this);
            }
            return createNodeList(realm.childNodes);
        },
        set: childNodes.set,
    });

    defineProperty(NodePrototype, 'hasChildNodes', {
        /**
         * @this {Node}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (hasChildNodes).value.call(this);
            }
            return !!realm.childNodes.length;
        },
        set: hasChildNodes.set,
    });

    defineProperty(NodePrototype, 'firstChild', {
        /**
         * @this {Node}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').GetterDescriptor} */ (firstChild).get.call(this) ?? null;
            }
            return realm.childNodes[0] ?? null;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (lastChild).get.call(this) ?? null;
            }
            return realm.childNodes[realm.childNodes.length - 1] ?? null;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (parentNode).get.call(this) ?? null;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (parentElement).get.call(this) ?? null;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (previousSibling).get.call(this) ?? null;
            }
            return parentRealm.getPreviousSibling(this) ?? null;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (nextSibling).get.call(this) ?? null;
            }
            return parentRealm.getNextSibling(this) ?? null;
        },
        set: nextSibling.set,
    });
}
