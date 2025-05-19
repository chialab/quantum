import { createHtmlCollection, createNodeList } from './NodeList.js';

/**
 * @typedef {{ addedNodes: Node[]; removedNodes: Node[]; previousSibling: Node | null; nextSibling: Node | null }} MutationRecord
 */

/**
 * @typedef {(mutations: MutationRecord[]) => void} RealmChangeCallback
 */

const REALM_SYMBOL = Symbol();
const REALM_PARENT_SYMBOL = Symbol();

/**
 * Create and attach a realm for a node.
 * @param {HTMLElement & { [REALM_SYMBOL]?: Realm }} node The root node.
 * @returns The realm instance.
 */
export function attachRealm(node) {
    return new Realm(node);
}

/**
 * Get the realm instance for a node.
 * @param {Node & { [REALM_SYMBOL]?: Realm }} node The root node.
 * @returns {Realm|null} The realm instance or null.
 */
export function getRealm(node) {
    return node[REALM_SYMBOL] ?? null;
}

/**
 * Get the parent realm instance for a node.
 * @param {Node & { [REALM_PARENT_SYMBOL]?: Realm }} node The child node.
 * @returns The parent realm instance or null.
 */
export function getParentRealm(node) {
    return node[REALM_PARENT_SYMBOL] ?? null;
}

/**
 * Get the owner realm instance for a node.
 * @param {Node & { [REALM_PARENT_SYMBOL]?: Realm } | null} node The child node.
 * @returns {Realm | null} The owner realm instance or null.
 */
export function getOwnerRealm(node) {
    if (!node) {
        return null;
    }
    return getRealm(node) ?? getParentRealm(node) ?? getOwnerRealm(node.parentElement) ?? null;
}

/**
 * Set the parent realm instance for a node.
 * @param {Node & { [REALM_PARENT_SYMBOL]?: Realm | null }} node The child node.
 * @param {Realm | null} realm The parent realm instance.
 */
function setParentRealm(node, realm) {
    node[REALM_PARENT_SYMBOL] = realm;
}

/**
 * Get the real node from a proxy.
 * @template {Node & { __node?: T } | null} T The type of the node.
 * @param {T} node The proxy node.
 * @returns {T} The real node.
 */
export function normalizeNode(node) {
    return node?.__node ?? node;
}

/**
 * Normalize a list of nodes.
 * @param {(string | Node)[]} nodes
 * @returns {(string | Node)[]} The normalized nodes list.
 */
export function normalizeNodes(nodes) {
    return nodes.map((node) => (typeof node === 'string' ? node : normalizeNode(node)));
}

/**
 * The realm class.
 */
export class Realm {
    /**
     * The root node of the realm.
     * @type {HTMLElement & { [REALM_SYMBOL]?: Realm }}
     * @protected
     */
    _node;

    /**
     * The owenr document of the realm.
     * @type {Document}
     * @protected
     */
    _document;

    /**
     * The proxy for the realm root to use for internal rendering.
     * @type {HTMLElement}
     * @protected
     */
    _root;

    /**
     * The child nodes of the realm.
     * @type {Node[]}
     * @protected
     */
    _childNodes;

    /**
     * The fragment used to temporary store nodes.
     * @type {DocumentFragment}
     * @protected
     */
    _fragment;

    /**
     * The callbacks to call when the realm changes.
     * @type {Set<RealmChangeCallback>}
     * @protected
     */
    _callbacks = new Set();

    /**
     * The proxied nodes in the realm.
     * @type {WeakMap<Node, Node>}
     * @protected
     */
    _proxies = new WeakMap();

    /**
     * Setup the realm.
     * @param {HTMLElement} node The root node of the realm.
     */
    constructor(node) {
        if (node.nodeType !== 1 /** Node.ELEMENT_NODE */) {
            throw new Error('Realm must be created with an element node');
        }
        if (REALM_SYMBOL in node) {
            throw new Error('Node already has a realm');
        }
        this._node = node;
        this._document = node.ownerDocument || document;
        this._fragment = this._document.createDocumentFragment();
        this._root = this._createProxy(node);
        this.initialize();
    }

    /**
     * The host node of the realm.
     */
    get node() {
        return this._node;
    }

    /**
     * The root node of the realm.
     */
    get root() {
        return this._root;
    }

    /**
     * The child nodes of the realm.
     * @returns {Node[]} The child nodes of the realm.
     * @deprecated Use `getChildren` instead.
     */
    get childNodes() {
        return this.getChildren();
    }

    /**
     * Initialize the realm.
     */
    initialize() {
        this.node[REALM_SYMBOL] = undefined;
        this._childNodes = Array.from(this.node.childNodes).map((node) => {
            this._fragment.appendChild(node);
            if (!getOwnerRealm(node)) {
                setParentRealm(node, this);
            }
            return node;
        });
        this.node[REALM_SYMBOL] = this;

        if (typeof customElements !== 'undefined') {
            customElements.upgrade(this._fragment);
        }

        this._notifyUpdate();
    }

    /**
     * Get a proxy for a node.
     * @template {Node} T The type of the node.
     * @param {T} node The node to get the proxy for.
     * @returns {T} The proxied node.
     */
    resolveNode(node) {
        if (this._proxies.has(node)) {
            return /** @type {T} */ (this._proxies.get(node));
        }
        const proxy = this._createProxy(node);
        this._proxies.set(node, proxy);
        return proxy;
    }

    /**
     * Create a proxy for a node.
     * @template {Node} T The type of the node.
     * @param {T} node
     * @returns {T} The proxied node.
     * @protected
     */
    _createProxy(node) {
        const realm = this;
        const proto = Object.getPrototypeOf(node);
        const store = new Map();
        const proxy = new Proxy(node, {
            get(target, propertyKey) {
                if (propertyKey === '__node') {
                    return node;
                }
                if (propertyKey === REALM_SYMBOL || propertyKey === REALM_PARENT_SYMBOL) {
                    return null;
                }
                if (propertyKey === 'constructor') {
                    return target.constructor;
                }

                switch (propertyKey) {
                    case 'append':
                    case 'appendChild':
                    case 'remove':
                    case 'removeChild':
                    case 'replaceChild':
                    case 'replaceWith':
                    case 'insertBefore':
                    case 'prepend':
                    case 'after':
                    case 'before':
                    case 'insertAdjacentElement':
                    case 'contains': {
                        const value = Reflect.get(target, propertyKey, proxy);
                        if (typeof value === 'function') {
                            return value.bind(proxy);
                        }
                        return value;
                    }
                    case 'textContent':
                    case 'innerHTML':
                    case 'nodeValue': {
                        const parentRealm = getOwnerRealm(node);
                        if (parentRealm === realm) {
                            return null;
                        }
                        return Reflect.get(target, propertyKey, proxy);
                    }
                    case 'firstChild':
                    case 'firstElementChild':
                    case 'lastChild':
                    case 'lastElementChild':
                    case 'previousSibling':
                    case 'previousElementSibling':
                    case 'nextSibling':
                    case 'nextElementSibling': {
                        const child = /** @type {Node} */ (Reflect.get(target, propertyKey, proxy));
                        if (child) {
                            return realm.resolveNode(child);
                        }
                        return child;
                    }
                    case 'parentNode':
                    case 'parentElement': {
                        const parent = /** @type {Node} */ (Reflect.get(target, propertyKey, proxy));
                        if (parent === realm.node) {
                            return realm.root;
                        }
                        return parent;
                    }
                    case 'childNodes':
                        return createNodeList(
                            Array.from(Reflect.get(target, propertyKey, proxy)).map((child) => realm.resolveNode(child))
                        );
                    case 'children':
                        return createHtmlCollection(
                            Array.from(/** @type {HTMLCollection} */ (Reflect.get(target, propertyKey, proxy))).map(
                                (child) => realm.resolveNode(child)
                            )
                        );
                    case 'childElementCount':
                    case 'assignedSlot':
                        return Reflect.get(target, propertyKey, proxy);
                    case 'shadowRoot':
                        return null;
                    default: {
                        if (store.has(propertyKey)) {
                            return store.get(propertyKey);
                        }
                        if (!(propertyKey in proto)) {
                            return undefined;
                        }
                        const value = Reflect.get(target, propertyKey, node);
                        if (typeof value === 'function') {
                            return value.bind(node);
                        }
                        return value;
                    }
                }
            },
            has(target, propertyKey) {
                if (store.has(propertyKey)) {
                    return true;
                }
                if (!(propertyKey in proto)) {
                    return false;
                }
                return Reflect.has(target, propertyKey);
            },
            set(_target, propertyKey, value) {
                switch (propertyKey) {
                    case 'textContent':
                    case 'innerHTML':
                    case 'nodeValue': {
                        return Reflect.set(node, propertyKey, value);
                    }
                    default:
                        store.set(propertyKey, value);
                        break;
                }
                return true;
            },
            getPrototypeOf() {
                return proto;
            },
        });

        return proxy;
    }

    /**
     * Add a callback to call when the realm changes.
     * @param {RealmChangeCallback} callback The callback to invoke.
     */
    observe(callback) {
        this._callbacks.add(callback);
    }

    /**
     * Remove a registered callback.
     * @param {RealmChangeCallback} callback The callback to remove.
     */
    unobserve(callback) {
        this._callbacks.delete(callback);
    }

    /**
     * Notifiy a realm update
     * @param {MutationRecord[]} mutations The list of mutations that triggered the update.
     */
    _notifyUpdate(mutations = []) {
        this._callbacks.forEach((callback) => callback(mutations));
    }

    /**
     * Get the child nodes of the realm.
     * @param {boolean} [filterElements=false] Whether to filter only element nodes.
     * @returns {Node[]} The child nodes of the realm.
     */
    getChildren(filterElements = false) {
        return this._childNodes.filter((node) =>
            filterElements ? node.nodeType === 1 /** Node.ELEMENT_NODE */ : true
        );
    }

    /**
     * Get the previous sibling of a node in the realm.
     * @param {Node | null} node The node to get the previous sibling of.
     * @param {boolean} [filterElements=false] Whether to filter only element nodes.
     * @returns The previous sibling of the node.
     */
    getPreviousSibling(node, filterElements = false) {
        if (!node) {
            return null;
        }
        let io = this._childNodes.indexOf(node);
        if (io === -1) {
            return null;
        }
        while (--io >= 0) {
            const child = this._childNodes[io];
            if (!filterElements || child.nodeType === 1 /** Node.ELEMENT_NODE */) {
                return child;
            }
        }
        return null;
    }

    /**
     * Get the next sibling of a node in the realm.
     * @param {Node | null} node The node to get the next sibling of.
     * @param {boolean} [filterElements=false] Whether to filter only element nodes.
     * @returns The next sibling of the node.
     */
    getNextSibling(node, filterElements = false) {
        if (!node) {
            return null;
        }
        let io = this._childNodes.indexOf(node);
        if (io === -1) {
            return null;
        }
        const length = this._childNodes.length;
        while (++io < length) {
            const child = this._childNodes[io];
            if (!filterElements || child.nodeType === 1 /** Node.ELEMENT_NODE */) {
                return child;
            }
        }
        return null;
    }

    /**
     * Get the first child of the realm.
     * @param {boolean} [filterElements=false] Whether to filter only element nodes.
     * @returns {Node | null} The first child of the realm.
     */
    getFirstChild(filterElements = false) {
        const length = this._childNodes.length;
        let i = 0;
        while (i < length) {
            const child = this._childNodes[i];
            if (!filterElements || child.nodeType === 1 /** Node.ELEMENT_NODE */) {
                return child;
            }
            i++;
        }
        return null;
    }

    /**
     * Get the last child of the realm.
     * @param {boolean} [filterElements=false] Whether to filter only element nodes.
     * @returns {Node | null} The last child of the realm.
     */
    getLastChild(filterElements = false) {
        let i = this._childNodes.length - 1;
        while (i >= 0) {
            const child = this._childNodes[i];
            if (!filterElements || child.nodeType === 1 /** Node.ELEMENT_NODE */) {
                return child;
            }
            i--;
        }
        return null;
    }

    /**
     * Normalize nodes list.
     * @param {(Node | string)[]} nodes The nodes to normalize.
     * @param {Node[]} [acc] The accumulator.
     * @returns {Node[]} The normalized nodes.
     */
    _importNodes(nodes, acc = []) {
        return nodes.reduce((acc, node) => {
            if (typeof node === 'string') {
                node = this._document.createTextNode(node);
                setParentRealm(node, this);
                this._fragment.appendChild(node);
                acc.push(node);
            } else if (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) {
                this._importNodes(Array.from(node.childNodes), acc);
            } else {
                const ownerRealm = getOwnerRealm(node);
                if (ownerRealm) {
                    if (!ownerRealm.contains(this)) {
                        ownerRealm.remove(node);
                        setParentRealm(node, this);
                        this._fragment.appendChild(node);
                    }
                } else {
                    setParentRealm(node, this);
                    this._fragment.appendChild(node);
                }
                acc.push(node);
            }
            return acc;
        }, acc);
    }

    /**
     * Internal method to append nodes to the realm.
     * @protected
     * @param {(Node | string)[]} nodes The nodes to append.
     * @returns {Node[]} The nodes that were appended.
     */
    _append(nodes) {
        const changed = this._importNodes(nodes);
        changed.forEach((child) => {
            const previousIndex = this._childNodes.indexOf(child);
            if (previousIndex !== -1) {
                this._childNodes.splice(previousIndex, 1);
            }
        });
        this._childNodes.push(...changed);

        return changed;
    }

    /**
     * Internal method to prepend nodes to the realm.
     * @protected
     * @param {(Node | string)[]} nodes The nodes to prepend.
     * @returns {Node[]} The nodes that were prepended.
     */
    _prepend(nodes) {
        const changed = this._importNodes(nodes);
        changed.forEach((child) => {
            const previousIndex = this._childNodes.indexOf(child);
            if (previousIndex !== -1) {
                this._childNodes.splice(previousIndex, 1);
            }
        });
        this._childNodes.unshift(...changed);

        return changed;
    }

    /**
     * Internal method to remove nodes to the realm.
     * @protected
     * @param {Node[]} nodes The nodes to remove.
     * @returns {Node[]} The nodes that were removed.
     */
    _remove(nodes) {
        nodes.forEach((child) => {
            const io = this._childNodes.indexOf(child);
            if (io !== -1) {
                if (getOwnerRealm(child) === this) {
                    setParentRealm(child, null);
                    this._proxies.delete(child);
                }
                this._childNodes.splice(io, 1);
                if (this._fragment.contains(child)) {
                    this._fragment.removeChild(child);
                }
            } else {
                throw new Error(
                    "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
                );
            }
        });

        return nodes;
    }

    /**
     * Internal method to insert nodes to the realm.
     * @protected
     * @param {Node} node The node before which new nodes are to be inserted.
     * @param {(Node | string)[]} nodes The nodes to insert.
     * @returns {Node[]} The nodes that were inserted.
     */
    _insert(node, nodes) {
        let io = this._childNodes.indexOf(node);
        if (io === -1) {
            throw new Error(
                "Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node."
            );
        }

        const changed = this._importNodes(nodes);
        changed.forEach((child) => {
            const previousIndex = this._childNodes.indexOf(child);
            if (previousIndex !== -1) {
                this._childNodes.splice(previousIndex, 1);
                if (previousIndex < io) {
                    io--;
                }
            }
        });
        this._childNodes.splice(io, 0, ...changed);

        return changed;
    }

    /**
     * Append nodes to the realm.
     * @param  {(ChildNode | string)[]} nodes The nodes to append.
     * @returns {Node[]} The nodes that were appended.
     */
    append(...nodes) {
        const changed = this._append(nodes);
        this._notifyUpdate([
            {
                addedNodes: changed,
                removedNodes: [],
                previousSibling: this.getPreviousSibling(changed[0]),
                nextSibling: this.getNextSibling(changed[changed.length - 1]),
            },
        ]);

        return changed;
    }

    /**
     * Prepend nodes to the realm.
     * @param {(Node | string)[]} nodes The nodes to prepend.
     * @returns {Node[]} The nodes that were prepended.
     */
    prepend(...nodes) {
        const changed = this._prepend(nodes);
        this._notifyUpdate([
            {
                addedNodes: changed,
                removedNodes: [],
                previousSibling: this.getPreviousSibling(changed[0]),
                nextSibling: this.getNextSibling(changed[changed.length - 1]),
            },
        ]);

        return changed;
    }

    /**
     * Remove nodes from the realm.
     * @param {Node[]} nodes The nodes to remove.
     * @returns {Node[]} The nodes that were removed.
     */
    remove(...nodes) {
        const previousSibling = this.getPreviousSibling(nodes[0]);
        const nextSibling = this.getNextSibling(nodes[nodes.length - 1]);
        this._remove(nodes);
        this._notifyUpdate([
            {
                addedNodes: [],
                removedNodes: nodes,
                previousSibling,
                nextSibling,
            },
        ]);

        return nodes;
    }

    /**
     * Replaces a realm node with nodes, while replacing strings in nodes with equivalent Text nodes.
     * @param {Node} node The node to replace.
     * @param {(Node | string)[]} nodes The nodes or strings to replace node with. Strings are replaced with equivalent Text nodes.
     * @returns {Node[]} The nodes that were inserted.
     */
    replaceWith(node, ...nodes) {
        const previousSibling = this.getPreviousSibling(node);
        const nextSibling = this.getNextSibling(node);
        const removed = this._remove([node]);
        let appended;
        if (nextSibling) {
            appended = this._insert(nextSibling, nodes);
        } else {
            appended = this._append(nodes);
        }
        this._notifyUpdate([
            {
                addedNodes: appended,
                removedNodes: removed,
                previousSibling,
                nextSibling,
            },
        ]);

        return appended;
    }

    /**
     * Inserts nodes or contents in the realm before node.
     * @param {Node | null} node The node before which new nodes are to be inserted.
     * @param {(Node | string)[]} nodes The nodes to be inserted.
     * @returns {Node[]} The nodes that were inserted.
     */
    insertBefore(node, ...nodes) {
        const previousSibling = this.getPreviousSibling(node);
        const appended = node ? this._insert(node, nodes) : this._append(nodes);
        this._notifyUpdate([
            {
                addedNodes: appended,
                removedNodes: [],
                previousSibling,
                nextSibling: node,
            },
        ]);
        return appended;
    }

    /**
     * Get the text content of the realm.
     * @returns {string} The text content of the realm.
     */
    getTextContent() {
        const walker = this._document.createTreeWalker(this.node, NodeFilter.SHOW_TEXT);
        let textContent = '';
        while (walker.nextNode()) {
            textContent += walker.currentNode.nodeValue;
        }
        return textContent;
    }

    /**
     * Get the HTML content of the realm.
     * @returns {string} The HTML content of the realm.
     */
    getHTML() {
        const walker = this._document.createTreeWalker(this.node, NodeFilter.SHOW_ALL);
        /**
         * @type {HTMLElement[]}
         */
        const parentsStack = [];
        let html = '';
        while (walker.nextNode()) {
            const currentParent = parentsStack[parentsStack.length - 1];
            const node = walker.currentNode;
            switch (node.nodeType) {
                case 1:
                    html += `<${/** @type {HTMLElement} */ (node).tagName.toLowerCase()}${Array.from(
                        /** @type {HTMLElement} */ (node).attributes
                    )
                        .map((attr) => ` ${attr.name}="${attr.value}"`)
                        .join(' ')}>`;
                    parentsStack.push(/** @type {HTMLElement} */ (node));
                    break;
                case 3:
                    html += node.nodeValue;
                    break;
                case 8:
                    html += `<!--${node.nodeValue}-->`;
                    break;
                default:
                    break;
            }

            if (currentParent && currentParent.lastChild === node) {
                parentsStack.pop();
                html += `</${currentParent.tagName.toLowerCase()}>`;
            }
        }
        if (parentsStack.length) {
            html += `</${parentsStack[parentsStack.length - 1].tagName.toLowerCase()}>`;
        }
        return html;
    }

    /**
     * Filter child nodes by `slot` attribute name.
     * @param {string|null} name The name of the slot. `null` for unnamed slot.
     */
    childNodesBySlot(name = null) {
        return this._childNodes.filter((child) => {
            if (getOwnerRealm(child) !== this) {
                // collect nodes from other realms
                return !name;
            }
            if (child.nodeType !== 1 /** Node.ELEMENT_NODE */) {
                // collect non-element nodes only if the slot is unnamed
                return !name;
            }

            const slotName = /** @type {HTMLElement} */ (child).getAttribute('slot') || null;
            return slotName === name;
        });
    }

    /**
     * Check if a realm is contained in this realm.
     * @param {Realm} realm The child realm.
     * @returns {boolean} Whether the realm is contained in this realm.
     */
    contains(realm) {
        return this.root.contains(realm.node);
    }
}
