import { getParentRealm, getRealm, normalizeNode, normalizeNodes } from './Realm.js';
import { defineProperty, getOwnPropertyDescriptors } from './utils.js';

/**
 * Extends the Element prototype with realm aware methods.
 * @param {typeof Element} Element The Element constructor to extend.
 */
export function extendElement(Element) {
    const ElementPrototype = Element.prototype;
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
        insertAdjacentElement,
        shadowRoot,
        assignedSlot,
        innerHTML,
    } = getOwnPropertyDescriptors(ElementPrototype);

    defineProperty(ElementPrototype, 'append', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (append).value.apply(
                    normalizeNode(this),
                    normalizeNodes(nodes)
                );
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (prepend).value.apply(
                    normalizeNode(this),
                    normalizeNodes(nodes)
                );
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (remove).value.call(normalizeNode(this));
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (children).get.call(normalizeNode(this));
            }
            return realm.getChildren(true);
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (childElementCount).get.call(
                    normalizeNode(this)
                );
            }
            return realm.getChildren(true).length;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (firstElementChild).get.call(
                    normalizeNode(this)
                );
            }
            return realm.getFirstChild(true);
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (lastElementChild).get.call(
                    normalizeNode(this)
                );
            }
            return realm.getLastChild(true);
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
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (previousElementSibling).get.call(
                        normalizeNode(this)
                    ) ?? null
                );
            }
            return parentRealm.getPreviousSibling(this, true);
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
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (nextElementSibling).get.call(
                        normalizeNode(this)
                    ) ?? null
                );
            }
            return parentRealm.getNextSibling(this, true);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (after).value.apply(
                    normalizeNode(this),
                    normalizeNodes(nodes)
                );
            }
            const sibling = parentRealm.getNextSibling(this);
            if (sibling) {
                return parentRealm.insertBefore(normalizeNode(sibling), ...nodes);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (before).value.apply(
                    normalizeNode(this),
                    normalizeNodes(nodes)
                );
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (replaceWith).value.apply(
                    normalizeNode(this),
                    normalizeNodes(nodes)
                );
            }
            return parentRealm.replaceWith(this, ...nodes);
        },
    });

    defineProperty(ElementPrototype, 'insertAdjacentElement', {
        /**
         * @this {Element}
         * @param {'beforebegin'|'afterbegin'|'beforeend'|'afterend'} position
         * @param {ChildNode} node
         */
        value(position, node) {
            const realm = getRealm(this);
            const parentRealm = getParentRealm(this);
            switch (position) {
                case 'beforebegin':
                    if (!parentRealm) {
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.call(
                            normalizeNode(this),
                            position,
                            node
                        );
                    }
                    return parentRealm.insertBefore(this, node);
                case 'afterend':
                    if (!parentRealm) {
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.call(
                            normalizeNode(this),
                            position,
                            node
                        );
                    }
                    return parentRealm.insertBefore(this.nextSibling, node);
                case 'afterbegin':
                    if (!realm) {
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.call(
                            normalizeNode(this),
                            position,
                            node
                        );
                    }
                    return realm.prepend(node);
                case 'beforeend':
                    if (!realm) {
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.call(
                            normalizeNode(this),
                            position,
                            node
                        );
                    }
                    return realm.append(node);
            }
        },
    });

    defineProperty(ElementPrototype, 'shadowRoot', {
        /**
         * @this {Element}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (shadowRoot).get.call(normalizeNode(this)) ??
                    null
                );
            }

            return realm.root;
        },
        set: shadowRoot.set,
    });

    defineProperty(ElementPrototype, 'assignedSlot', {
        /**
         * @this {Element}
         */
        get() {
            const parentRealm = getParentRealm(this);
            if (!parentRealm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (assignedSlot).get.call(normalizeNode(this)) ??
                    null
                );
            }

            return parentRealm.resolveNode(this).parentNode ?? null;
        },
        set: assignedSlot.set,
    });

    defineProperty(ElementPrototype, 'innerHTML', {
        /**
         * @this {Element}
         */
        get() {
            const realm = getRealm(this);
            if (!realm) {
                return (
                    /** @type {import('./utils.js').GetterDescriptor} */ (innerHTML).get.call(normalizeNode(this)) ??
                    null
                );
            }
            return realm.getHTML() ?? null;
        },
        /**
         * @this {Element}
         * @param {string} value
         */
        set(value) {
            const setter = /** @type {import('./utils.js').SetterDescriptor} */ (innerHTML).set.bind(
                normalizeNode(this)
            );
            const realm = getRealm(this);
            if (realm) {
                for (const child of this.childNodes) {
                    this.removeChild(child);
                }
                setter(value);
                realm.initialize();
                return;
            }
            setter(value);
        },
    });
}
