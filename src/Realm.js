/**
 * @typedef {{ addedNodes: ChildNode[]; removedNodes: ChildNode[]; previousSibling: ChildNode | null; nextSibling: ChildNode | null }} MutationRecord
 */

import { createNodeList } from './NodeList.js';

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

    node[REALM_SYMBOL] = new Realm(node);
    return node[REALM_SYMBOL];
}

/**
 * Get the realm instance for a node.
 * @param {Node & { [REALM_SYMBOL]?: Realm }} node The root node.
 * @returns {Realm|null} The realm instance or null.
 */
function getRealm(node) {
    return node[REALM_SYMBOL] ?? null;
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
    _childNodes = [];

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
     * Whether the realm is connected.
     * @type {boolean}
     * @protected
     */
    _connected = false;

    /**
     * The symbol used to identify the host prototype.
     */
    _hostSymbol = Symbol();

    /**
     * The symbol used to identify the child prototype.
     */
    _childSymbol = Symbol();

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
            if (realm && !realm.open && !opened) {
                return realm;
            }
            parentNode = parentNode.parentNode;
        }

        return null;
    }

    /**
     * Find the prototype of the realm in the prototype chain.
     * @param {Node} node The node to find the prototype of.
     * @param {symbol} symbol The symbol to use to find the prototype.
     * @returns {Node | null} The realm prototype target.
     */
    _findPrototypeTarget(node, symbol) {
        let target = node;
        let proto = Object.getPrototypeOf(target);
        while (proto) {
            if (Object.getOwnPropertySymbols(proto).includes(symbol)) {
                return target;
            }
            target = proto;
            proto = Object.getPrototypeOf(proto);
        }

        return null;
    }

    /**
     * Restore the prototype of a node.
     * @param {Node} node The node to restore the prototype of.
     * @param {symbol} symbol The symbol to use to find the prototype.
     */
    _restorePrototype(node, symbol) {
        const target = this._findPrototypeTarget(node, symbol);
        if (target) {
            Object.setPrototypeOf(
                target,
                Object.getPrototypeOf(Object.getPrototypeOf(target))
            );
        }
    }

    /**
     * Initialize the realm.
     * @protected
     */
    _initialize() {
        this._childNodes = [].slice.call(this.node.childNodes);
        this._childNodes.forEach((node) => {
            this.adopt(node);
        });

        if (typeof customElements !== 'undefined') {
            customElements.upgrade(this._fragment);
        }
    }

    /**
     * Connect the realm to the node.
     */
    connect() {
        this._initialize();

        const realm = this;
        const proto = Object.getPrototypeOf(this.node);
        const hostProto = {
            // From Node.prototype
            /**
             * @this {Node}
             * @param {ChildNode} node
             */
            appendChild(node) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'appendChild', this).call(
                        this,
                        node
                    );
                }
                return realm.append(node);
            },
            /**
             * @this {Node}
             * @param {ChildNode} node
             */
            removeChild(node) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'removeChild', this).call(
                        this,
                        node
                    );
                }
                return realm.remove(node);
            },
            /**
             * @this {Node}
             * @param {ChildNode} node
             * @param {ChildNode} child
             */
            replaceChild(node, child) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'replaceChild', this).call(
                        this,
                        node,
                        child
                    );
                }
                return realm.replaceWith(child, node);
            },
            /**
             * @this {Node}
             * @param {ChildNode} node
             * @param {ChildNode | null} refNode
             */
            insertBefore(node, refNode) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'insertBefore', this).call(
                        this,
                        node,
                        refNode
                    );
                }
                return realm.insertBefore(refNode, node);
            },
            /**
             * @this {Node}
             */
            hasChildNodes() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'hasChildNodes', this).call(this);
                }
                return !!realm.childNodes.length;
            },
            /**
             * @this {Node}
             */
            get childNodes() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'childNodes', this);
                }
                return createNodeList(realm.childNodes);
            },
            /**
             * @this {Node}
             */
            get firstChild() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'firstChild', this);
                }
                return realm.childNodes[0] ?? null;
            },
            /**
             * @this {Node}
             */
            get lastChild() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'lastChild', this);
                }
                return realm.childNodes[realm.childNodes.length - 1] ?? null;
            },
            // From Element.prototype
            /**
             * @this {Element}
             * @param {(ChildNode | string)[]} nodes
             */
            append(...nodes) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'append', this).call(
                        this,
                        ...nodes
                    );
                }
                return realm.append(...nodes);
            },
            /**
             * @this {Element}
             * @param {(ChildNode | string)[]} nodes
             */
            prepend(...nodes) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'prepend', this).call(
                        this,
                        ...nodes
                    );
                }
                return realm.prepend(...nodes);
            },
            /**
             * @this {Element}
             */
            get children() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'children', this);
                }
                return realm.childNodes.filter((node) => node.nodeType === 1);
            },
            /**
             * @this {Element}
             */
            get childElementCount() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'childElementCount', this);
                }
                return realm.childNodes.filter((node) => node.nodeType === 1)
                    .length;
            },
            /**
             * @this {Element}
             */
            get firstElementChild() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'firstElementChild', this);
                }
                return (
                    realm.childNodes.find((node) => node.nodeType === 1) ?? null
                );
            },
            /**
             * @this {Element}
             */
            get lastElementChild() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'lastElementChild', this);
                }

                let io = realm.childNodes.length;
                while (io-- > 0) {
                    const node = realm.childNodes[io];
                    if (node.nodeType === 1) {
                        return node;
                    }
                }
                return null;
            },
            /**
             * @this {Element}
             * @param {'beforebegin'|'afterbegin'|'beforeend'|'afterend'} position
             * @param {ChildNode} node
             */
            insertAdjacentElement(position, node) {
                if (realm.open || opened) {
                    return Reflect.get(
                        proto,
                        'insertAdjacentElement',
                        this
                    ).call(this, position, node);
                }
                switch (position) {
                    case 'afterbegin':
                        return realm.prepend(node);
                    case 'beforeend':
                        return realm.append(node);
                    default:
                        return Reflect.get(
                            proto,
                            'insertAdjacentElement',
                            this
                        ).call(this, position, node);
                }
            },
            /**
             * @this {Element}
             */
            get textContent() {
                return Reflect.get(proto, 'textContent', this);
            },
            /**
             * @this {Element}
             * @param {string} value
             */
            set textContent(value) {
                realm.remove(...realm.childNodes);
                Reflect.set(proto, 'textContent', value, this);
                realm._initialize();
            },
            /**
             * @this {Element}
             */
            get innerHTML() {
                return Reflect.get(proto, 'innerHTML', this);
            },
            /**
             * @this {Element}
             * @param {string} value
             */
            set innerHTML(value) {
                realm.remove(...realm.childNodes);
                Reflect.set(proto, 'innerHTML', value, this);
                realm._initialize();
            },
            [this._hostSymbol]: true,
        };
        Object.setPrototypeOf(hostProto, proto);
        Object.setPrototypeOf(this.node, hostProto);

        this._connected = true;
        this._notifyUpdate();
    }

    /**
     * Disconnect the realm from the node.
     */
    disconnect() {
        this._connected = false;

        this.requestUpdate(() => {
            let childNode = this.node.lastChild;
            while (childNode) {
                this.node.removeChild(childNode);
                childNode = this.node.lastChild;
            }
        });
        this._childNodes.forEach((node) => {
            this._release(node);
        });
        this._childNodes = [];
        this._restorePrototype(this.node, this._hostSymbol);
        this.node.appendChild(this._fragment);
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
     * @protected
     * @param {MutationRecord[]} mutations The list of mutations that triggered the update.
     */
    _notifyUpdate(mutations = []) {
        if (!this._connected) {
            return;
        }
        this._callbacks.forEach((callback) => callback(mutations));
    }

    /**
     * Get the previous sibling of a node in the realm.
     * @param {ChildNode | null} node The node to get the previous sibling of.
     * @param {boolean} [filterElement=true] Whether to filter elements.
     * @returns The previous sibling of the node.
     */
    getPreviousSibling(node, filterElement = false) {
        if (!node) {
            return null;
        }
        let io = this._childNodes.indexOf(node);
        while (--io >= 0) {
            const previousSibling = this._childNodes[io] ?? null;
            if (!filterElement || previousSibling.nodeType === 1) {
                return previousSibling;
            }
        }
        return null;
    }

    /**
     * Get the next sibling of a node in the realm.
     * @param {ChildNode | null} node The node to get the next sibling of.
     * @param {boolean} [filterElement=true] Whether to filter elements.
     * @returns The next sibling of the node.
     */
    getNextSibling(node, filterElement = false) {
        if (!node) {
            return null;
        }
        let io = this._childNodes.indexOf(node);
        while (++io < this._childNodes.length) {
            const nextSibling = this._childNodes[io] ?? null;
            if (!filterElement || nextSibling.nodeType === 1) {
                return nextSibling;
            }
        }
        return null;
    }

    /**
     * Release a node from the realm.
     * @protected
     * @param {Node} node The node to release.
     */
    _release(node) {
        setParentRealm(node, null);
        this._restorePrototype(node, this._childSymbol);
    }

    /**
     * Adopt a node into the realm.
     * @protected
     * @param {Node} node The node to adopt.
     */
    _adopt(node) {
        setParentRealm(node, this);
        this._fragment.appendChild(node);

        const realm = this;
        const proto = Object.getPrototypeOf(node);
        const childProto = {
            // From Node.prototype
            /**
             * @this {Node}
             */
            get parentNode() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'parentNode', this);
                }
                return realm.node;
            },
            /**
             * @this {Node}
             */
            get parentElement() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'parentElement', this);
                }
                return realm.node;
            },
            /**
             * @this {Node}
             */
            get previousSibling() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'previousSibling', this);
                }
                return realm.getPreviousSibling(
                    /** @type {ChildNode} */ (this)
                );
            },
            /**
             * @this {Node}
             */
            get nextSibling() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'nextSibling', this);
                }
                return realm.getNextSibling(/** @type {ChildNode} */ (this));
            },
            /**
             * @this {Node}
             */
            get previousElementSibling() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'previousElementSibling', this);
                }
                return realm.getPreviousSibling(
                    /** @type {ChildNode} */ (this),
                    true
                );
            },
            /**
             * @this {Node}
             */
            get nextElementSibling() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'nextElementSibling', this);
                }
                return realm.getNextSibling(
                    /** @type {ChildNode} */ (this),
                    true
                );
            },
            /**
             * @this {ChildNode}
             */
            remove() {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'remove', this).call(this);
                }
                return realm.remove(this);
            },
            /**
             * @this {ChildNode}
             * @param {(ChildNode | string)[]} nodes
             */
            after(...nodes) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'after', this).call(
                        this,
                        ...nodes
                    );
                }
                const sibling = realm.getNextSibling(this);
                if (sibling) {
                    return realm.insertBefore(sibling, ...nodes);
                }
                return realm.append(...nodes);
            },
            /**
             * @this {ChildNode}
             * @param {(ChildNode | string)[]} nodes
             */
            before(...nodes) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'before', this).call(
                        this,
                        ...nodes
                    );
                }
                return realm.insertBefore(this, ...nodes);
            },
            /**
             * @this {ChildNode}
             * @param {(ChildNode | string)[]} nodes
             */
            replaceWith(...nodes) {
                if (realm.open || opened) {
                    return Reflect.get(proto, 'replaceWith', this).call(
                        this,
                        ...nodes
                    );
                }
                return realm.replaceWith(this, ...nodes);
            },
            [this._childSymbol]: true,
        };
        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
            Object.assign(childProto, {
                // From Element.prototype
                /**
                 * @this {Element}
                 * @param {'beforebegin'|'afterbegin'|'beforeend'|'afterend'} position
                 * @param {ChildNode} node
                 */
                insertAdjacentElement(position, node) {
                    if (realm.open || opened) {
                        return Reflect.get(
                            proto,
                            'insertAdjacentElement',
                            this
                        ).call(this, position, node);
                    }
                    switch (position) {
                        case 'beforebegin':
                            return realm.insertBefore(this, node);
                        case 'afterend':
                            return realm.insertBefore(this.nextSibling, node);
                        default:
                            return Reflect.get(
                                proto,
                                'insertAdjacentElement',
                                this
                            ).call(this, position, node);
                    }
                },
            });
        }
        Object.setPrototypeOf(childProto, proto);
        Object.setPrototypeOf(node, childProto);
    }

    /**
     * Adopt a node into the realm.
     * @param {Node} node The node to adopt.
     */
    adopt(node) {
        const ownerRealm = getOwnerRealm(node);
        if (ownerRealm) {
            if (!ownerRealm.contains(this)) {
                ownerRealm.remove(/** @type {ChildNode} */ (node));
                this._adopt(node);
            }
        } else {
            this._adopt(node);
        }
    }

    /**
     * Normalize nodes list.
     * @protected
     * @param {(Node | string)[]} nodes The nodes to normalize.
     * @param {ChildNode[]} [acc] The accumulator.
     * @returns The normalized nodes.
     */
    _importNodes(nodes, acc = []) {
        return nodes.reduce((acc, node) => {
            if (typeof node === 'string') {
                const textNode = this._document.createTextNode(node);
                this.adopt(textNode);
                acc.push(textNode);
            } else if (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) {
                this._importNodes(Array.from(node.childNodes), acc);
            } else {
                this.adopt(node);
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
                    this._release(child);
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
