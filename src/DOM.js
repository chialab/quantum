import { getRealm, getParentRealm } from './Realm.js';

/**
 * @typedef {Omit<PropertyDescriptor, 'get'> & Required<Pick<PropertyDescriptor, 'get'>>} GetterDescriptor
 */

/**
 * @typedef {Omit<PropertyDescriptor, 'value'> & Required<Pick<PropertyDescriptor, 'value'>>} ValueDescriptor
 */

export function mutatePrototypes() {
    const { defineProperty } = Object;
    const { filter, find, reverse } = Array.prototype;
    const NodePrototype = Node.prototype;
    const ElementPrototype = Element.prototype;
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
    } = Object.getOwnPropertyDescriptors(NodePrototype);
    const {
        append,
        prepend,
        remove,
        children,
        childElementCount,
        firstElementChild,
        lastElementChild,
        previousElementSibling,
        nextElementSibling,
        after,
        before,
        replaceWith,
    } = Object.getOwnPropertyDescriptors(ElementPrototype);

    defineProperty(NodePrototype, 'appendChild', {
        /**
         * @this {Node}
         * @param {ChildNode} node
         */
        value(node) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {ValueDescriptor} */ (appendChild).value.call(this, node);
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
                return /** @type {ValueDescriptor} */ (removeChild).value.call(this, node);
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
                return /** @type {ValueDescriptor} */ (replaceChild).value.call(this, node, child);
            }
            return realm.replaceWith(node, child);
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
                return /** @type {ValueDescriptor} */ (insertBefore).value.call(this, node, child);
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
                return /** @type {GetterDescriptor} */ (childNodes).get.call(this);
            }
            return realm.childNodes;
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
                return /** @type {GetterDescriptor} */ (hasChildNodes).get.call(this);
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
                return /** @type {GetterDescriptor} */ (firstChild).get.call(this) ?? null;
            }
            return realm.childNodes.item(0) ?? null;
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
                return /** @type {GetterDescriptor} */ (lastChild).get.call(this) ?? null;
            }
            return realm.childNodes.item(/** @type {GetterDescriptor} */ (childNodes).get.length - 1) ?? null;
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
                return /** @type {GetterDescriptor} */ (parentNode).get.call(this) ?? null;
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
                return /** @type {GetterDescriptor} */ (parentElement).get.call(this) ?? null;
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
                return /** @type {GetterDescriptor} */ (previousSibling).get.call(this) ?? null;
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
                return /** @type {GetterDescriptor} */ (nextSibling).get.call(this) ?? null;
            }
            return parentRealm.getNextSibling(this) ?? null;
        },
        set: nextSibling.set,
    });

    defineProperty(ElementPrototype, 'append', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {ValueDescriptor} */ (append).value.apply(this, nodes);
            }
            return realm.append(...nodes);
        },
    });

    defineProperty(ElementPrototype, 'prepend', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {ValueDescriptor} */ (prepend).value.apply(this, nodes);
            }
            return realm.prepend(...nodes);
        },
    });

    defineProperty(ElementPrototype, 'remove', {
        /**
         * @this {Element}
         */
        value() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return /** @type {ValueDescriptor} */ (remove).value.call(this);
            }
            return parentRealm.remove(this);
        },
    });

    defineProperty(ElementPrototype, 'children', {
        /**
         * @this {Element}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {GetterDescriptor} */ (children).get.call(this);
            }
            return filter.call(realm.childNodes, (node) => node.nodeType === 1);
        },
        set: children.set,
    });

    defineProperty(ElementPrototype, 'childElementCount', {
        /**
         * @this {Element}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {GetterDescriptor} */ (childElementCount).get.call(this);
            }
            return filter.call(realm.childNodes, (node) => node.nodeType === 1).length;
        },
        set: childElementCount.set,
    });

    defineProperty(ElementPrototype, 'firstElementChild', {
        /**
         * @this {Element}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {GetterDescriptor} */ (firstElementChild).get.call(this);
            }
            return find.call(realm.childNodes, (node) => node.nodeType === 1) ?? null;
        },
        set: firstElementChild.set,
    });

    defineProperty(ElementPrototype, 'lastElementChild', {
        /**
         * @this {Element}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {GetterDescriptor} */ (lastElementChild).get.call(this);
            }
            return reverse.call(realm.childNodes).find((node) => node.nodeType === 1) ?? null;
        },
        set: lastElementChild.set,
    });

    defineProperty(ElementPrototype, 'previousElementSibling', {
        /**
         * @this {Element}
         */
        get() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return /** @type {GetterDescriptor} */ (previousElementSibling).get.call(this) ?? null;
            }

            let sibling = parentRealm.getPreviousSibling(this);
            while (sibling) {
                if (sibling.nodeType === 1) {
                    return sibling;
                }
                sibling = parentRealm.getPreviousSibling(this);
            }
            return null;
        },
        set: previousElementSibling.set,
    });

    defineProperty(ElementPrototype, 'nextElementSibling', {
        /**
         * @this {Element}
         */
        get() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return /** @type {GetterDescriptor} */ (nextElementSibling).get.call(this) ?? null;
            }

            let sibling = parentRealm.getNextSibling(this);
            while (sibling) {
                if (sibling.nodeType === 1) {
                    return sibling;
                }
                sibling = parentRealm.getNextSibling(this);
            }
            return null;
        },
        set: nextElementSibling.set,
    });
    defineProperty(ElementPrototype, 'after', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return /** @type {ValueDescriptor} */ (after).value.apply(this, nodes);
            }
            const sibling = parentRealm.getNextSibling(this);
            if (sibling) {
                return parentRealm.insertBefore(sibling, ...nodes);
            }
            return parentRealm.append(...nodes);
        },
    });

    defineProperty(ElementPrototype, 'before', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return /** @type {ValueDescriptor} */ (before).value.apply(this, nodes);
            }
            return parentRealm.insertBefore(this, ...nodes);
        },
    });

    defineProperty(ElementPrototype, 'replaceWith', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return /** @type {ValueDescriptor} */ (replaceWith).value.apply(this, nodes);
            }
            return parentRealm.replaceWith(this, ...nodes);
        },
    });
}
