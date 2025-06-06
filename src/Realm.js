/**
 * @typedef {{ addedNodes: ChildNode[]; removedNodes: ChildNode[]; previousSibling: ChildNode | null; nextSibling: ChildNode | null }} MutationRecord
 */

/**
 * @typedef {(mutations: MutationRecord[]) => void} RealmChangeCallback
 */

const REALM_SYMBOL = Symbol();
const REALM_PARENT_SYMBOL = Symbol();

/**
 * Whether all realms are open.
 */
let opened = false;

/**
 * Open all realms.
 */
export function dangerouslyOpenRealms() {
    opened = true;
}

/**
 * Close all realms.
 */
export function dangerouslyCloseRealms() {
    opened = false;
}

/**
 * Open all realms and call a callback.
 * @template {(...args: any) => any} T The type of the callback.
 * @param {T} callback The callback to invoke.
 * @returns {ReturnType<T>} The result of the callback.
 */
export function dangerouslyEnterRealms(callback) {
    opened = true;

    try {
        const result = callback();
        if (result instanceof Promise) {
            return /** @type {ReturnType<T>} */ (
                result.finally(() => {
                    opened = false;
                    return result;
                })
            );
        }
        opened = false;

        return result;
    } catch (err) {
        opened = false;

        throw err;
    }
}

/**
 * Create and attach a realm for a node.
 * @param {HTMLElement & { [REALM_SYMBOL]?: Realm }} node The root node.
 * @returns The realm instance.
 */
export function attachRealm(node) {
    if (REALM_SYMBOL in node) {
        throw new Error('Node already has a realm');
    }

    return (node[REALM_SYMBOL] = new Realm(node));
}

/**
 * Get the realm instance for a node.
 * @param {Node & { [REALM_SYMBOL]?: Realm }} node The root node.
 * @param {boolean} editMode Whether to return a realm in edit mode.
 * @returns {Realm|null} The realm instance or null.
 */
export function getRealm(node, editMode = false) {
    const realm = node[REALM_SYMBOL] ?? null;
    if (opened) {
        if (editMode && realm) {
            throw new Error(
                'Cannot get realm in edit mode when all realms are open'
            );
        }
        return null;
    }
    if (realm && !realm.open) {
        return realm;
    }
    return null;
}

/**
 * Get the parent realm instance for a node.
 * @param {Node & { [REALM_PARENT_SYMBOL]?: Realm }} node The child node.
 * @param {boolean} editMode Whether to return a realm in edit mode.
 * @returns The parent realm instance or null.
 */
export function getParentRealm(node, editMode = false) {
    if (opened) {
        if (editMode) {
            throw new Error(
                'Cannot get realm in edit mode when all realms are open'
            );
        }
        return null;
    }
    const realm = node[REALM_PARENT_SYMBOL] ?? null;
    if (realm && !realm.open) {
        return realm;
    }
    return null;
}

/**
 * Get the owner realm instance for a node.
 * @param {Node & { [REALM_PARENT_SYMBOL]?: Realm }} node The child node.
 * @returns The owner realm instance or null.
 */
function getOwnerRealm(node) {
    return node[REALM_PARENT_SYMBOL] ?? null;
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
 * The realm class.
 */
export class Realm {
    /**
     * The root node of the realm.
     * @type {HTMLElement}
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
    _proxy;

    /**
     * The child nodes of the realm.
     * @type {ChildNode[]}
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
     * Whether the realm is open.
     * @type {boolean}
     * @protected
     */
    _open = false;

    /**
     * Setup the realm.
     * @param {HTMLElement} node The root node of the realm.
     */
    constructor(node) {
        this._node = node;
        this._document = node.ownerDocument || document;
        this._fragment = this._document.createDocumentFragment();

        const store = new Map();
        const proto = Object.getPrototypeOf(node);
        this._proxy = new Proxy(node, {
            get(target, propertyKey) {
                if (!(propertyKey in proto)) {
                    return store.get(propertyKey);
                }

                const value = Reflect.get(target, propertyKey, node);
                if (typeof value === 'function') {
                    return value.bind(node);
                }
                return value;
            },
            has(target, propertyKey) {
                if (propertyKey in store) {
                    return true;
                }
                return Reflect.has(target, propertyKey);
            },
            set(_target, propertyKey, value) {
                store.set(propertyKey, value);
                return true;
            },
        });

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
        return this._proxy;
    }

    /**
     * The child nodes of the realm as a NodeList.
     */
    get childNodes() {
        return this._childNodes.slice(0);
    }

    /**
     * Whether the realm is open.
     */
    get open() {
        return this._open;
    }

    /**
     * Get the closest realm ancestor of a node.
     * @returns {Realm | null} A realm or null.
     */
    get ownerRealm() {
        let parentNode = this._node.parentNode;
        while (parentNode) {
            const realm = getRealm(parentNode);
            if (realm) {
                return realm;
            }
            parentNode = parentNode.parentNode;
        }

        return null;
    }

    /**
     * Initialize the realm.
     */
    initialize() {
        this._childNodes = [].slice.call(this.node.childNodes);

        this._childNodes.forEach((node) => {
            this._fragment.appendChild(node);
            if (!getOwnerRealm(node)) {
                setParentRealm(node, this);
            }
        });

        if (typeof customElements !== 'undefined') {
            customElements.upgrade(this._fragment);
        }

        this._notifyUpdate();
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
     * Open the realm.
     * When using this method, you must call `dangerouslyClose` when you are done,
     * or things will get unstable.
     */
    dangerouslyOpen() {
        this._open = true;
    }

    /**
     * Close the realm.
     */
    dangerouslyClose() {
        this._open = false;
    }

    /**
     * Request an update of the realm.
     * @template {(...args: any) => any} T The type of the callback.
     * @param {T} callback The callback to invoke.
     * @returns {ReturnType<T>} The result of the callback.
     */
    requestUpdate(callback) {
        this.dangerouslyOpen();

        try {
            const result = callback();
            if (result instanceof Promise) {
                return /** @type {ReturnType<T>} */ (
                    result.finally(() => {
                        this.dangerouslyClose();
                        return result;
                    })
                );
            }
            this.dangerouslyClose();

            return result;
        } catch (err) {
            this.dangerouslyClose();

            throw err;
        }
    }

    /**
     * Notifiy a realm update
     * @param {MutationRecord[]} mutations The list of mutations that triggered the update.
     */
    _notifyUpdate(mutations = []) {
        this.requestUpdate(() =>
            this._callbacks.forEach((callback) => callback(mutations))
        );
    }

    /**
     * Get the previous sibling of a node in the realm.
     * @param {ChildNode | null} node The node to get the previous sibling of.
     * @returns The previous sibling of the node.
     */
    getPreviousSibling(node) {
        if (!node) {
            return null;
        }
        const io = this._childNodes.indexOf(node);
        if (io === -1) {
            return null;
        }
        return this._childNodes[io - 1] ?? null;
    }

    /**
     * Get the next sibling of a node in the realm.
     * @param {ChildNode | null} node The node to get the next sibling of.
     * @returns The next sibling of the node.
     */
    getNextSibling(node) {
        if (!node) {
            return null;
        }
        const io = this._childNodes.indexOf(node);
        if (io === -1) {
            return null;
        }
        return this._childNodes[io + 1] ?? null;
    }

    /**
     * Normalize nodes list.
     * @param {(Node | string)[]} nodes The nodes to normalize.
     * @param {ChildNode[]} [acc] The accumulator.
     * @returns The normalized nodes.
     */
    _importNodes(nodes, acc = []) {
        return nodes.reduce((acc, node) => {
            if (typeof node === 'string') {
                node = this._document.createTextNode(node);
                setParentRealm(node, this);
                this._fragment.appendChild(node);
                acc.push(/** @type {ChildNode} */ (node));
            } else if (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) {
                this._importNodes(Array.from(node.childNodes), acc);
            } else {
                const ownerRealm = getOwnerRealm(node);
                if (ownerRealm) {
                    if (!ownerRealm.contains(this)) {
                        ownerRealm.remove(/** @type {ChildNode} */ (node));
                        setParentRealm(node, this);
                        this._fragment.appendChild(node);
                    }
                } else {
                    setParentRealm(node, this);
                    this._fragment.appendChild(node);
                }
                acc.push(/** @type {ChildNode} */ (node));
            }
            return acc;
        }, acc);
    }

    /**
     * Internal method to append nodes to the realm.
     * @protected
     * @param {(Node | string)[]} nodes The nodes to append.
     * @returns The nodes that were appended.
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
     * @returns The nodes that were prepended.
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
     * @param {ChildNode[]} nodes The nodes to remove.
     * @returns The nodes that were removed.
     */
    _remove(nodes) {
        nodes.forEach((child) => {
            const io = this._childNodes.indexOf(child);
            if (io !== -1) {
                if (getOwnerRealm(child) === this) {
                    setParentRealm(child, null);
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
     * @param {ChildNode} node The node before which new nodes are to be inserted.
     * @param {(Node | string)[]} nodes The nodes to insert.
     * @returns The nodes that were inserted.
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
    }

    /**
     * Prepend nodes to the realm.
     * @param {(Node | string)[]} nodes The nodes to prepend.
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
    }

    /**
     * Remove nodes from the realm.
     * @param {ChildNode[]} nodes The nodes to remove.
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
    }

    /**
     * Replaces a realm node with nodes, while replacing strings in nodes with equivalent Text nodes.
     * @param {ChildNode} node The node to replace.
     * @param {(Node | string)[]} nodes The nodes or strings to replace node with. Strings are replaced with equivalent Text nodes.
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
    }

    /**
     * Inserts nodes or contents in the realm before node.
     * @param {ChildNode | null} node The node before which new nodes are to be inserted.
     * @param {(Node | string)[]} nodes The nodes to be inserted.
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
    }

    /**
     * Filter child nodes by `slot` attribute name.
     * @param {string|null} name The name of the slot. `null` for unnamed slot.
     */
    childNodesBySlot(name = null) {
        return this.childNodes.filter((child) => {
            if (getOwnerRealm(child) !== this) {
                // collect nodes from other realms
                return !name;
            }
            if (child.nodeType !== 1 /** Node.ELEMENT_NODE */) {
                // collect non-element nodes only if the slot is unnamed
                return !name;
            }

            const slotName =
                /** @type {HTMLElement} */ (child).getAttribute('slot') || null;
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
