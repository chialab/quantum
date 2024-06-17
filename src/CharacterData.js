import { getParentRealm } from './Realm.js';
import { defineProperty, getOwnPropertyDescriptors } from './utils.js';

/**
 * Extends the CharacterData prototype with realm aware methods.
 * @param {typeof CharacterData} CharacterData The CharacterData constructor to extend.
 */
export function extendCharacterData(CharacterData) {
    const CharacterDataPrototype = CharacterData.prototype;
    const { remove, previousElementSibling, nextElementSibling, after, before, replaceWith } =
        getOwnPropertyDescriptors(CharacterDataPrototype);

    defineProperty(CharacterDataPrototype, 'remove', {
        /**
         * @this {Element}
         */
        value() {
            const parentRealm = getParentRealm(this, true);
            if (!parentRealm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (remove).value.call(this);
            }
            return parentRealm.remove(this);
        },
    });

    defineProperty(CharacterDataPrototype, 'previousElementSibling', {
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

    defineProperty(CharacterDataPrototype, 'nextElementSibling', {
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
    defineProperty(CharacterDataPrototype, 'after', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const parentRealm = getParentRealm(this, true);
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

    defineProperty(CharacterDataPrototype, 'before', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const parentRealm = getParentRealm(this, true);
            if (!parentRealm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (before).value.apply(this, nodes);
            }
            return parentRealm.insertBefore(this, ...nodes);
        },
    });

    defineProperty(CharacterDataPrototype, 'replaceWith', {
        /**
         * @this {Element}
         * @param {(ChildNode | string)[]} nodes
         */
        value(...nodes) {
            const parentRealm = getParentRealm(this, true);
            if (!parentRealm) {
                return /** @type {import('./utils.js').ValueDescriptor} */ (replaceWith).value.apply(this, nodes);
            }
            return parentRealm.replaceWith(this, ...nodes);
        },
    });
}
