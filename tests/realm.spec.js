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
});
