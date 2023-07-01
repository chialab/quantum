/**
 * A shim for the NodeList class.
 */
const ShimNodeList = /** @type {{ new(array: Node[]): NodeList; prototype: NodeList }} */ (
    /** @type {unknown} */ (
        class ShimNodeList {
            /**
             * The array of nodes.
             * @type {Node[]}
             * @private
             */
            _array;

            /**
             * Creates a new NodeList.
             * @param {Node[]} array The array of nodes.
             */
            constructor(array) {
                this._array = array;
            }

            /**
             * The number of nodes in the NodeList.
             */
            get length() {
                return this._array.length;
            }

            /**
             * Returns the node at the given index.
             * @param {number} index The index of the node.
             * @returns {Node | null} The node at the given index, or null if the index is out of range.
             */
            item(index) {
                return this._array[index] ?? null;
            }

            /**
             * Calls the given callback function for each node in the NodeList.
             * @param {(value: Node, key: number, parent: NodeList, thisArg?: any) => void} callbackfn The callback function.
             * @param {any} [thisArg] The value to use as `this` when calling the callback function.
             */
            forEach(callbackfn, thisArg) {
                this._array.forEach((node, key) =>
                    callbackfn(node, key, /** @type {NodeList} */ (/** @type {unknown} */ (this)), thisArg)
                );
            }

            /**
             * Returns an iterator for the NodeList entries.
             * @returns {IterableIterator<[number, Node]>}
             */
            entries() {
                return this._array.entries();
            }

            /**
             * Returns an iterator for the NodeList keys.
             * @returns {IterableIterator<number>}
             */
            keys() {
                return this._array.keys();
            }

            /**
             * Returns an iterator for the NodeList values.
             * @returns {IterableIterator<Node>}
             */
            values() {
                return this._array.values();
            }

            /**
             * Returns an iterator for the NodeList.
             * @returns {IterableIterator<Node>}
             */
            [Symbol.iterator]() {
                return this._array[Symbol.iterator]();
            }
        }
    )
);

export { ShimNodeList as NodeList };
