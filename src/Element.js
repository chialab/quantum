import { getRealm, getParentRealm } from './Realm.js';
import { defineProperty } from './utils.js';

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
} = Object.getOwnPropertyDescriptors(ElementPrototype);

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
        return Array.from(realm.childNodes).filter((node) => node.nodeType === 1);
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
        return Array.from(realm.childNodes).filter((node) => node.nodeType === 1).length;
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
        return Array.from(realm.childNodes).find((node) => node.nodeType === 1) ?? null;
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
        return (
            Array.from(realm.childNodes)
                .reverse()
                .find((node) => node.nodeType === 1) ?? null
        );
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
            return /** @type {import('./utils.js').GetterDescriptor} */ (previousElementSibling).get.call(this) ?? null;
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
