/**
 * Reconcile root children.
 * @param {HTMLElement} root The root element.
 * @param {ChildNode[]} nodes The nodes to reconcile.
 */
export function reconcile(root, nodes) {
    const children = root.childNodes;
    const length = nodes.length;

    let currentNode = children.item(0);
    for (let i = 0; i < length; i++) {
        const node = nodes[i];
        if (currentNode !== node) {
            root.insertBefore(node, currentNode);
        } else {
            currentNode = children.item(i + 1);
        }
    }

    while (children.length > length) {
        root.removeChild(/** @type {Node} */ (root.lastChild));
    }
}
