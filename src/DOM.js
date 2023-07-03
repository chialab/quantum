import { getRealm, getParentRealm } from './Realm.js';

/**
 * @typedef {Omit<PropertyDescriptor, 'get'> & Required<Pick<PropertyDescriptor, 'get'>>} GetterDescriptor
 */

/**
 * @typedef {Omit<PropertyDescriptor, 'value'> & Required<Pick<PropertyDescriptor, 'value'>>} ValueDescriptor
 */

const { defineProperty } = Object;
const NodePrototype = Node.prototype;
const ElementPrototype = Element.prototype;
const TreeWalkerPrototype = TreeWalker.prototype;
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
        return realm.replaceWith(child, node);
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
            return /** @type {ValueDescriptor} */ (hasChildNodes).value.call(this);
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
        return realm.childNodes.item(realm.childNodes.length - 1) ?? null;
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
            return /** @type {GetterDescriptor} */ (childElementCount).get.call(this);
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
            return /** @type {GetterDescriptor} */ (firstElementChild).get.call(this);
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
            return /** @type {GetterDescriptor} */ (lastElementChild).get.call(this);
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
            return /** @type {GetterDescriptor} */ (previousElementSibling).get.call(this) ?? null;
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
            return /** @type {GetterDescriptor} */ (nextElementSibling).get.call(this) ?? null;
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
