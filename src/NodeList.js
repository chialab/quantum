/**
 * Create a NodeList programmatically.
 * @param {ChildNode[]} childNodes Child nodes array.
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

                        return item.bind(target);
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
