/**
 * Create a NodeList programmatically.
 * @param {Node[]} childNodes Child nodes array.
 * @returns A NodeList.
 */
export function createNodeList(childNodes) {
    return /** @type {NodeList} */ (
        /** @type {unknown} */ (
            new Proxy(childNodes, {
                get(target, key) {
                    if (key === 'item') {
                        /**
                         * @this {ChildNode[]}
                         * @param {number} index
                         */
                        const item = function item(index) {
                            return this[index] || null;
                        };

                        return item.bind(/** @type {ChildNode[]} */ (target));
                    }

                    return Reflect.get(target, key);
                },
                has(target, key) {
                    if (key === 'item') {
                        return true;
                    }
                    return Reflect.has(target, key);
                },
                set(target, key, value) {
                    return Reflect.set(target, key, value);
                },
                getPrototypeOf() {
                    return NodeList.prototype;
                },
            })
        )
    );
}

/**
 * Create a HTMLCollection programmatically.
 * @param {Element[]} children Child elements array.
 * @returns A HTMLCollection.
 */
export function createHtmlCollection(children) {
    return /** @type {HTMLCollection} */ (
        /** @type {unknown} */ (
            new Proxy(children, {
                get(target, key) {
                    if (key === 'item') {
                        /**
                         * @this {Element[]}
                         * @param {number} index
                         */
                        const item = function item(index) {
                            return this[index] || null;
                        };

                        return item.bind(/** @type {Element[]} */ (target));
                    }
                    if (key === 'namedItem') {
                        /**
                         * @this {Element[]}
                         * @param {string} name
                         */
                        const namedItem = function namedItem(name) {
                            for (const element of this) {
                                if (element.getAttribute('id') === name || element.getAttribute('name') === name) {
                                    return element;
                                }
                            }
                            return null;
                        };

                        return namedItem.bind(/** @type {Element[]} */ (target));
                    }

                    return Reflect.get(target, key);
                },
                has(target, key) {
                    if (key === 'item') {
                        return true;
                    }
                    return Reflect.has(target, key);
                },
                set(target, key, value) {
                    return Reflect.set(target, key, value);
                },
                getPrototypeOf() {
                    return HTMLCollection.prototype;
                },
            })
        )
    );
}
