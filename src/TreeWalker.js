import { defineProperty } from './utils.js';

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

defineProperty(TreeWalkerPrototype, 'nextNode', {
    value() {
        if (!this.firstChild()) {
            while (!this.nextSibling() && this.parentNode()) {
                // iterate
            }
        }
        return this.currentNode;
    },
});

defineProperty(TreeWalkerPrototype, 'previousNode', {
    value() {
        while (!this.previousSibling() && this.parentNode()) {
            // iterate
        }
        return this.currentNode;
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

defineProperty(TreeWalkerPrototype, 'parentNode', {
    value() {
        const currentNode = this._currentNode || this.currentNode;
        if (currentNode !== this.root && currentNode.parentNode) {
            const node = currentNode.parentNode;
            if (filterNode(node, this.whatToShow, this.filter) === NodeFilter.FILTER_ACCEPT) {
                delete this._currentNode;
                this.currentNode = node;
                return this.currentNode;
            }
            this._currentNode = node;
            return this.parentNode();
        }
        delete this._currentNode;
        return null;
    },
});

defineProperty(TreeWalkerPrototype, 'firstChild', {
    value() {
        const currentNode = this._currentNode || this.currentNode;
        const childNodes = currentNode ? currentNode.childNodes : [];
        if (childNodes.length > 0) {
            const node = childNodes[0];
            if (filterNode(node, this.whatToShow, this.filter) === NodeFilter.FILTER_ACCEPT) {
                delete this._currentNode;
                this.currentNode = node;
                return this.currentNode;
            }
            this._currentNode = node;
            return this.nextSibling();
        }
        delete this._currentNode;
        return null;
    },
});

defineProperty(TreeWalkerPrototype, 'lastChild', {
    value() {
        const currentNode = this._currentNode || this.currentNode;
        const childNodes = currentNode ? currentNode.childNodes : [];
        if (childNodes.length > 0) {
            const node = childNodes[childNodes.length - 1];
            if (filterNode(node, this.whatToShow, this.filter) === NodeFilter.FILTER_ACCEPT) {
                delete this._currentNode;
                this.currentNode = node;
                return this.currentNode;
            }
            this._currentNode = node;
            return this.previousSibling();
        }
        delete this._currentNode;
        return null;
    },
});

defineProperty(TreeWalkerPrototype, 'previousSibling', {
    value() {
        const currentNode = this._currentNode || this.currentNode;
        if (currentNode !== this.root && currentNode.parentNode) {
            const siblings = Array.from(currentNode.parentNode.childNodes);
            const index = siblings.indexOf(currentNode);
            if (index > 0) {
                const node = siblings[index - 1];
                if (filterNode(node, this.whatToShow, this.filter) === NodeFilter.FILTER_ACCEPT) {
                    delete this._currentNode;
                    this.currentNode = node;
                    return this.currentNode;
                }
                this._currentNode = node;
                return this.previousSibling();
            }
        }
        delete this._currentNode;
        return null;
    },
});

defineProperty(TreeWalkerPrototype, 'nextSibling', {
    value() {
        const currentNode = this._currentNode || this.currentNode;
        if (currentNode !== this.root && currentNode.parentNode) {
            const siblings = Array.from(currentNode.parentNode.childNodes);
            const index = siblings.indexOf(currentNode);
            if (index + 1 < siblings.length) {
                const node = siblings[index + 1];
                if (filterNode(node, this.whatToShow, this.filter) === NodeFilter.FILTER_ACCEPT) {
                    delete this._currentNode;
                    this.currentNode = node;
                    return this.currentNode;
                }
                this._currentNode = node;
                return this.nextSibling();
            }
        }
        delete this._currentNode;
        return null;
    },
});
