import { extendElement } from './Element.js';
import { extendNode } from './Node.js';
import { extendTreeWalker } from './TreeWalker.js';

/**
 * Extend constructors in the given window namespace.
 * @param {Window & typeof globalThis} window The window namespace to extend.
 */
export function extend(window) {
    extendNode(window.Node);
    extendElement(window.Element);
    if (typeof window.TreeWalker !== 'undefined') {
        extendTreeWalker(window.TreeWalker, window.NodeFilter);
    }
}
