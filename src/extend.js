import { extendElement } from './Element.js';
import { extendNode } from './Node.js';
import { extendTreeWalker } from './TreeWalker.js';

/**
 * Whether the DOM environment is extended.
 */
let extended = false;

/**
 * Extend constructors in the given window namespace.
 * @param {Window & typeof globalThis} window The window namespace to extend.
 */
export function extend(window) {
    if (extended) {
        return;
    }
    extendNode(window.Node);
    extendElement(window.Element);
    extendTreeWalker(window.TreeWalker, window.NodeFilter);
    extended = true;
}
