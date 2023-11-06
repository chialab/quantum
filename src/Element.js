import { getRealm, getParentRealm } from './Realm.js';
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
    } = getOwnPropertyDescriptors(ElementPrototype);

    defineProperty(ElementPrototype, 'append', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const realm = getRealm(this);
            if (!realm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (append).value.apply(this, nodes);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (prepend).value.apply(this, nodes);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (remove).value.call(this);
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (children).get.call(this);
            }
            return realm.childNodes.filter((node) => node.nodeType === 1);
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (childElementCount).get.call(this);
            }
            return realm.childNodes.filter((node) => node.nodeType === 1).length;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (firstElementChild).get.call(this);
            }
            return realm.childNodes.find((node) => node.nodeType === 1) ?? null;
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (lastElementChild).get.call(this);
            }
            return realm.childNodes.reverse().find((node) => node.nodeType === 1) ?? null;
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
                    /** @type {import('./utils.js').GetterDescriptor} */ (previousElementSibling).get.call(this) ?? null
                );
            }

            let sibling = parentRealm.getPreviousSibling(this);
            while (sibling) {
                if (sibling.nodeType === 1) {
                    return sibling;
                }
                sibling = parentRealm.getPreviousSibling(sibling);
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
                return /** @type {import('./utils.js').GetterDescriptor} */ (nextElementSibling).get.call(this) ?? null;
            }

            let sibling = parentRealm.getNextSibling(this);
            while (sibling) {
                if (sibling.nodeType === 1) {
                    return sibling;
                }
                sibling = parentRealm.getNextSibling(sibling);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (after).value.apply(this, nodes);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (before).value.apply(this, nodes);
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
                return /** @type {import('./utils.js').ValueDescriptor} */ (replaceWith).value.apply(this, nodes);
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
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.apply(
                            this,
                            position,
                            node
                        );
                    }
                    return parentRealm.insertBefore(this, node);
                case 'afterend':
                    if (!parentRealm) {
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.apply(
                            this,
                            position,
                            node
                        );
                    }
                    return parentRealm.insertBefore(this.nextSibling, node);
                case 'afterbegin':
                    if (!realm) {
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.apply(
                            this,
                            position,
                            node
                        );
                    }
                    return realm.prepend(node);
                case 'beforeend':
                    if (!realm) {
                        return /** @type {import('./utils.js').ValueDescriptor} */ (insertAdjacentElement).value.apply(
                            this,
                            position,
                            node
                        );
                    }
                    return realm.append(node);
            }
        },
    });
}
