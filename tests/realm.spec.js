import { test, describe, expect } from 'vitest';
import { attachRealm } from '../src/index.js';

describe('realm', () => {
    test('attachRealm', () => {
        const container = document.createElement('div');
        const realm = attachRealm(container);
        expect(realm).toBeTypeOf('object');
    });

    test('attachRealm twice should error', () => {
        const container = document.createElement('div');
        attachRealm(container);
        expect(() => attachRealm(container)).toThrow();
    });

    test('Node.prototype.appendChild should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.appendChild(child);
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(child);
        expect(child.parentNode).toBe(container);
        expect(container.innerHTML).toBe('<div></div>');
    });

    test('Node.prototype.appendChild should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        attachRealm(container);
        container.appendChild(child);
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(child);
        expect(child.parentNode).toBe(container);
        expect(container.innerHTML).toBe('');
    });

    test('Node.prototype.removeChild should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.appendChild(child);
        container.removeChild(child);
        expect(container.childNodes.length).toBe(0);
        expect(child.parentNode).toBe(null);
    });

    test('Node.prototype.removeChild should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        attachRealm(container);
        container.appendChild(child);
        container.removeChild(child);
        expect(container.childNodes.length).toBe(0);
        expect(child.parentNode).toBe(null);
        expect(container.innerHTML).toBe('');
    });

    test('Node.prototype.replaceChild should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('span');
        container.appendChild(child);
        container.replaceChild(child2, child);
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(child2);
        expect(child.parentNode).toBe(null);
        expect(child2.parentNode).toBe(container);
        expect(container.innerHTML).toBe('<span></span>');
    });

    test('Node.prototype.replaceChild should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('span');
        attachRealm(container);
        container.appendChild(child);
        container.replaceChild(child2, child);
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(child2);
        expect(child.parentNode).toBe(null);
        expect(child2.parentNode).toBe(container);
        expect(container.innerHTML).toBe('');
    });

    test('Node.prototype.insertBefore should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('span');
        container.appendChild(child);
        container.insertBefore(child2, child);
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0]).toBe(child2);
        expect(container.childNodes[1]).toBe(child);
        expect(child.parentNode).toBe(container);
        expect(child2.parentNode).toBe(container);
        expect(container.innerHTML).toBe('<span></span><div></div>');
    });

    test('Node.prototype.insertBefore should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('span');
        attachRealm(container);
        container.appendChild(child);
        container.insertBefore(child2, child);
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0]).toBe(child2);
        expect(container.childNodes[1]).toBe(child);
        expect(child.parentNode).toBe(container);
        expect(child2.parentNode).toBe(container);
        expect(container.innerHTML).toBe('');
    });

    test('Node.prototype.hasChildNodes|firstChild|lastChild|parentNode|parentElement|previousSibling|nextSibling should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('div');
        const child3 = document.createElement('div');
        expect(container.hasChildNodes).toBe(false);
        expect(container.firstChild).toBe(null);
        expect(container.lastChild).toBe(null);
        expect(container.parentNode).toBe(null);
        expect(container.parentElement).toBe(null);
        container.append(child, child2, child3);
        expect(container.hasChildNodes).toBe(true);
        expect(container.firstChild).toBe(child);
        expect(container.lastChild).toBe(child3);
        expect(child.parentNode).toBe(container);
        expect(child.parentElement).toBe(container);
        expect(child.previousSibling).toBe(null);
        expect(child2.previousSibling).toBe(child);
        expect(child2.nextSibling).toBe(child3);
        expect(child3.nextSibling).toBe(null);
        expect(container.innerHTML).toBe('<div></div><div></div><div></div>');
    });

    test('Node.prototype.hasChildNodes|firstChild|lastChild|parentNode|parentElement|previousSibling|nextSibling should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('div');
        const child3 = document.createElement('div');
        attachRealm(container);
        expect(container.hasChildNodes).toBe(false);
        expect(container.firstChild).toBe(null);
        expect(container.lastChild).toBe(null);
        expect(container.parentNode).toBe(null);
        expect(container.parentElement).toBe(null);
        container.append(child, child2, child3);
        expect(container.hasChildNodes).toBe(true);
        expect(container.firstChild).toBe(child);
        expect(container.lastChild).toBe(child3);
        expect(child.parentNode).toBe(container);
        expect(child.parentElement).toBe(container);
        expect(child.previousSibling).toBe(null);
        expect(child2.previousSibling).toBe(child);
        expect(child2.nextSibling).toBe(child3);
        expect(child3.nextSibling).toBe(null);
        expect(container.innerHTML).toBe('');
    });

    test('Element.prototype.append should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.append(child, 'Hello');
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0]).toBe(child);
        expect(container.childNodes[1].textContent).toBe('Hello');
        expect(child.parentNode).toBe(container);
        expect(container.innerHTML).toBe('<div></div>Hello');
    });

    test('Element.prototype.append should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        attachRealm(container);
        container.append(child, 'Hello');
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0]).toBe(child);
        expect(container.childNodes[1].textContent).toBe('Hello');
        expect(child.parentNode).toBe(container);
        expect(container.innerHTML).toBe('');
    });

    test('Element.prototype.prepend should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.append(child);
        container.prepend('Hello');
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0].textContent).toBe('Hello');
        expect(container.childNodes[1]).toBe(child);
        expect(child.parentNode).toBe(container);
        expect(container.innerHTML).toBe('Hello<div></div>');
    });

    test('Element.prototype.prepend should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        attachRealm(container);
        container.append(child);
        container.prepend('Hello');
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0].textContent).toBe('Hello');
        expect(container.childNodes[1]).toBe(child);
        expect(child.parentNode).toBe(container);
        expect(container.innerHTML).toBe('');
    });
});
