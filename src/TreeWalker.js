import { defineProperty } from './utils.js';

/**
 * Extend TreeWalker prototype with realm aware methods.
 * Almost copied from JSDOM implementation.
 * @see {@link https://github.com/jsdom/jsdom/blob/main/lib/jsdom/living/traversal/TreeWalker-impl.js JSDOM implementation}
 * @param {typeof TreeWalker} TreeWalker The TreeWalker constructor to extend.
 * @param {typeof NodeFilter} NodeFilter The NodeFilter constructor to use.
 */
export function extendTreeWalker(TreeWalker, NodeFilter) {
    const TreeWalkerPrototype = TreeWalker.prototype;
    const NodeFilterMask = {
        1: NodeFilter.SHOW_ELEMENT,
        /* ATTRIBUTE_NODE */
        2: NodeFilter.SHOW_ATTRIBUTE,
        /* TEXT_NODE */
        3: NodeFilter.SHOW_TEXT,
        /* CDATA_SECTION_NODE */
        4: NodeFilter.SHOW_CDATA_SECTION,
        /* ENTITY_REFERENCE_NODE */
        5: NodeFilter.SHOW_ENTITY_REFERENCE,
        /* ENTITY_NODE */
        6: NodeFilter.SHOW_PROCESSING_INSTRUCTION,
        /* PROCESSING_INSTRUCTION_NODE */
        7: NodeFilter.SHOW_PROCESSING_INSTRUCTION,
        /* COMMENT_NODE */
        8: NodeFilter.SHOW_COMMENT,
        /* DOCUMENT_NODE */
        9: NodeFilter.SHOW_DOCUMENT,
        /* DOCUMENT_TYPE_NODE */
        10: NodeFilter.SHOW_DOCUMENT_TYPE,
        /* DOCUMENT_FRAGMENT_NODE */
        11: NodeFilter.SHOW_DOCUMENT_FRAGMENT,
        /* NOTATION_NODE */
        12: NodeFilter.SHOW_NOTATION,
    };

    defineProperty(TreeWalkerPrototype, 'currentNode', {
        get() {
            return this._currentNode;
        },
        set(node) {
            if (node === null) {
                throw new Error('Cannot set currentNode to null');
            }

            this._currentNode = node;
        },
    });

    /**
     * Filter node.
     * @param {Node} node The node to filter.
     * @param {number} whatToShow What to show.
     * @param {NodeFilter} [filter] Filter function.
     */
    const filterNode = (node, whatToShow, filter) => {
        const mask = NodeFilterMask[/** @type {keyof typeof NodeFilterMask} */ (node.nodeType)];
        if (mask && (whatToShow & mask) == 0) {
            return NodeFilter.FILTER_SKIP;
        }
        if (typeof filter === 'function') {
            return filter(node);
        }
        if (filter) {
            return filter.acceptNode(node);
        }
        return NodeFilter.FILTER_ACCEPT;
    };

    /**
     * Traverse children.
     * @param {Node} root The root node.
     * @param {Node} currentNode The current node.
     * @param {boolean} forward The type of traversal.
     * @param {number} whatToShow What to show.
     * @param {NodeFilter} [filter] Filter function.
     * @returns {Node | null}
     */
    const traverseChildren = (root, currentNode, forward, whatToShow, filter) => {
        let node = /** @type {Node} */ (forward === false ? currentNode.firstChild : currentNode.lastChild);
        if (node === null) {
            return null;
        }

        main: for (;;) {
            const result = filterNode(node, whatToShow, filter);

            if (result === NodeFilter.FILTER_ACCEPT) {
                return node;
            }

            if (result === NodeFilter.FILTER_SKIP) {
                const child = forward ? node.lastChild : node.firstChild;
                if (child !== null) {
                    node = child;
                    continue;
                }
            }

            for (;;) {
                const sibling = forward ? node.previousSibling : node.nextSibling;
                if (sibling !== null) {
                    node = sibling;
                    continue main;
                }

                const parent = node.parentNode;
                if (parent === null || parent === root || parent === currentNode) {
                    return null;
                }

                node = parent;
            }
        }
    };

    /**
     * Traverse siblings.
     * @param {Node} root The root node.
     * @param {Node} currentNode The current node.
     * @param {boolean} forward The type of traversal.
     * @param {number} whatToShow What to show.
     * @param {NodeFilter} [filter] Filter function.
     * @returns {Node | null}
     */
    const traverseSiblings = (root, currentNode, forward, whatToShow, filter) => {
        let node = currentNode;
        if (node === root) {
            return null;
        }

        for (;;) {
            let sibling = forward ? node.nextSibling : node.previousSibling;

            while (sibling !== null) {
                node = sibling;
                const result = filterNode(node, whatToShow, filter);
                if (result === NodeFilter.FILTER_ACCEPT) {
                    return node;
                }

                sibling = forward ? node.firstChild : node.lastChild;
                if (result === NodeFilter.FILTER_REJECT || sibling === null) {
                    sibling = forward ? node.nextSibling : node.previousSibling;
                }
            }

            node = /** @type {Node} */ (node.parentNode);
            if (node === null || node === root) {
                return null;
            }

            if (filterNode(node, whatToShow, filter) === NodeFilter.FILTER_ACCEPT) {
                return null;
            }
        }
    };

    defineProperty(TreeWalkerPrototype, 'parentNode', {
        value() {
            let node = this._currentNode || this.root;
            while (node !== null && node !== this.root) {
                node = node.parentNode;

                if (node !== null && filterNode(node, this.whatToShow, this.filter) === NodeFilter.FILTER_ACCEPT) {
                    return (this._currentNode = node);
                }
            }
            return null;
        },
    });

    defineProperty(TreeWalkerPrototype, 'firstChild', {
        value() {
            return (this._currentNode = traverseChildren(
                this.root,
                this._currentNode || this.root,
                false,
                this.whatToShow,
                this.filter
            ));
        },
    });

    defineProperty(TreeWalkerPrototype, 'lastChild', {
        value() {
            return (this._currentNode = traverseChildren(
                this.root,
                this._currentNode || this.root,
                true,
                this.whatToShow,
                this.filter
            ));
        },
    });

    defineProperty(TreeWalkerPrototype, 'previousSibling', {
        value() {
            return (this._currentNode = traverseSiblings(
                this.root,
                this._currentNode || this.root,
                false,
                this.whatToShow,
                this.filter
            ));
        },
    });

    defineProperty(TreeWalkerPrototype, 'nextSibling', {
        value() {
            return (this._currentNode = traverseSiblings(
                this.root,
                this._currentNode || this.root,
                true,
                this.whatToShow,
                this.filter
            ));
        },
    });

    defineProperty(TreeWalkerPrototype, 'previousNode', {
        value() {
            let node = this._currentNode || this.root;

            while (node !== this.root) {
                let sibling = node.previousSibling;

                while (sibling !== null) {
                    node = sibling;

                    let result = filterNode(node, this.whatToShow, this.filter);
                    while (result !== NodeFilter.FILTER_REJECT && node.hasChildNodes()) {
                        node = node.lastChild;
                        result = filterNode(node, this.whatToShow, this.filter);
                    }

                    if (result === NodeFilter.FILTER_ACCEPT) {
                        return (this._currentNode = node);
                    }
                    sibling = node.previousSibling;
                }

                if (node === this.root || node.parentNode === null) {
                    return null;
                }

                node = node.parentNode;
                if (filterNode(node, this.whatToShow, this.filter) === NodeFilter.FILTER_ACCEPT) {
                    return (this._currentNode = node);
                }
            }

            return null;
        },
    });

    defineProperty(TreeWalkerPrototype, 'nextNode', {
        value() {
            let node = this._currentNode || this.root;
            /**
             * @type {number}
             */
            let result = NodeFilter.FILTER_ACCEPT;

            for (;;) {
                while (result !== NodeFilter.FILTER_REJECT && node.hasChildNodes()) {
                    node = node.firstChild;
                    result = filterNode(node, this.whatToShow, this.filter);
                    if (result === NodeFilter.FILTER_ACCEPT) {
                        return (this._currentNode = node);
                    }
                }

                do {
                    if (node === this.root) {
                        return null;
                    }

                    const sibling = node.nextSibling;

                    if (sibling !== null) {
                        node = sibling;
                        break;
                    }

                    node = node.parentNode;
                } while (node !== null);

                if (node === null) {
                    return null;
                }

                result = filterNode(node, this.whatToShow, this.filter);

                if (result === NodeFilter.FILTER_ACCEPT) {
                    return (this._currentNode = node);
                }
            }
        },
    });
}
