import { describe, expect, test } from 'vitest';
import { attachRealm, getNode } from '../src/index.js';

const simpleSlot = (realm) => () => {
    if (realm.root.firstChild) {
        for (const node of realm.root.firstChild.childNodes) {
            node.remove();
        }
    } else {
        const slot = document.createElement('div');
        slot.className = 'slot';
        realm.root.append(slot);
    }
    realm.root.firstChild.append(...realm.getChildren());
};

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

    test('attachRealm on non element nodes should error', () => {
        const node = document.createTextNode('test');
        expect(() => attachRealm(node)).toThrow();
    });

    test('Realm should be re-initialized after html changes', () => {
        const container = document.createElement('div');
        const realm = attachRealm(container);
        realm.observe(simpleSlot(realm));
        container.innerHTML = '<span>test</span>';
        expect(container.childNodes.length).toBe(1);
        expect(realm.root.firstChild.childNodes.length).toBe(1);
        expect(realm.root.firstChild.firstChild.tagName).toBe('SPAN');
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
        const realm = attachRealm(container);
        container.appendChild(child);
        expect(realm.root.innerHTML).toBe('');
        realm.root.append('pre', realm.getFirstChild(), 'post');
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(child);
        expect(getNode(child.parentNode)).toBe(container);
        expect(realm.root.childNodes.length).toBe(3);
        expect(getNode(realm.root.childNodes[1])).toBe(child);
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
        const realm = attachRealm(container);
        realm.observe(simpleSlot(realm));
        container.appendChild(child);
        expect(realm.root.innerHTML).toBe('<div class="slot"><div></div></div>');
        container.removeChild(child);
        expect(container.childNodes.length).toBe(0);
        expect(child.parentNode).toBe(null);
        expect(realm.root.innerHTML).toBe('<div class="slot"></div>');
    });

    test('Node.prototype.replaceChild should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('span');
        container.appendChild(child);
        expect(container.innerHTML).toBe('<div></div>');
        container.replaceChild(child2, child);
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(child2);
        expect(child.parentNode).toBe(null);
        expect(child2.parentNode).toBe(container);
        expect(container.innerHTML).toBe('<span></span>');
    });

    test('Node.prototype.replaceChild should work in realm', () => {
        const container = document.createElement('div');
        const realm = attachRealm(container);
        realm.observe(simpleSlot(realm));
        const child = document.createElement('div');
        const child2 = document.createElement('span');
        container.appendChild(child);
        expect(realm.root.innerHTML).toBe('<div class="slot"><div></div></div>');
        container.replaceChild(child2, child);
        expect(container.childNodes.length).toBe(1);
        expect(container.childNodes[0]).toBe(child2);
        expect(child.parentNode).toBe(null);
        expect(getNode(child2.parentNode)).toBe(container);
        expect(realm.root.innerHTML).toBe('<div class="slot"><span></span></div>');
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
        const child3 = document.createElement('article');
        const realm = attachRealm(container);
        container.appendChild(child);
        container.insertBefore(child2, child);
        container.appendChild(child3);
        expect(container.childNodes.length).toBe(3);
        expect(container.childNodes[0]).toBe(child2);
        expect(container.childNodes[1]).toBe(child);
        expect(container.childNodes[2]).toBe(child3);
        expect(getNode(child.parentNode)).toBe(container);
        expect(getNode(child2.parentNode)).toBe(container);
        expect(getNode(child3.parentNode)).toBe(container);
        expect(realm.root.innerHTML).toBe('');
        container.insertBefore(child2, child3);
        expect(container.childNodes[0]).toBe(child);
        expect(container.childNodes[1]).toBe(child2);
        expect(container.childNodes[2]).toBe(child3);
    });

    test('Node.prototype.hasChildNodes|firstChild|lastChild|parentNode|parentElement|previousSibling|nextSibling should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('div');
        const child3 = document.createElement('div');
        expect(container.hasChildNodes()).toBe(false);
        expect(container.firstChild).toBe(null);
        expect(container.lastChild).toBe(null);
        expect(container.parentNode).toBe(null);
        expect(container.parentElement).toBe(null);
        container.append(child, child2, child3);
        expect(container.hasChildNodes()).toBe(true);
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
        const realm = attachRealm(container);
        expect(container.hasChildNodes()).toBe(false);
        expect(container.firstChild).toBe(null);
        expect(container.lastChild).toBe(null);
        expect(container.parentNode).toBe(null);
        expect(container.parentElement).toBe(null);
        container.append(child, child2, child3);
        expect(container.hasChildNodes()).toBe(true);
        expect(container.firstChild).toBe(child);
        expect(container.lastChild).toBe(child3);
        expect(getNode(child.parentNode)).toBe(container);
        expect(getNode(child.parentElement)).toBe(container);
        expect(child.previousSibling).toBe(null);
        expect(child2.previousSibling).toBe(child);
        expect(child2.nextSibling).toBe(child3);
        expect(child3.nextSibling).toBe(null);
        expect(realm.root.innerHTML).toBe('');
        realm.root.append(child);
        expect(child.parentNode).toBe(container);
        expect(realm.root.firstChild.parentNode).toBe(realm.root);
    });

    test('Node.prototype.nodeValue should work as usual', () => {
        const child = document.createTextNode('test');
        expect(child.nodeValue).toBe('test');
        child.nodeValue = 'test2';
        expect(child.nodeValue).toBe('test2');
    });

    test('Node.prototype.nodeValue should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createTextNode('test');
        const realm = attachRealm(container);
        container.appendChild(child);
        realm.root.appendChild(child);
        expect(child.nodeValue).toBe('test');
        child.nodeValue = 'test2';
        expect(child.nodeValue).toBe('test2');
        expect(realm.root.firstChild.nodeValue).toBeNull();
    });

    test('Node.prototype.textContent should work as usual', () => {
        const container = document.createTextNode('test');
        expect(container.textContent).toBe('test');
        container.textContent = 'test2';
        expect(container.textContent).toBe('test2');
    });

    test('Node.prototype.textContent should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createTextNode('test');
        const realm = attachRealm(container);
        container.appendChild(child);
        realm.root.append('pre', child, 'post');
        expect(child.textContent).toBe('test');
        expect(container.textContent).toBe('test');
        expect(realm.root.textContent).toBe('pretestpost');
        child.textContent = 'test2';
        expect(child.textContent).toBe('test2');
        expect(realm.root.childNodes[1].textContent).toBeNull();
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
        const realm = attachRealm(container);
        container.append(child, 'Hello');
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0]).toBe(child);
        expect(container.childNodes[1].textContent).toBe('Hello');
        expect(getNode(child.parentNode)).toBe(container);
        expect(realm.root.innerHTML).toBe('');
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
        const realm = attachRealm(container);
        container.append(child);
        container.prepend('Hello');
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[0].textContent).toBe('Hello');
        expect(container.childNodes[1]).toBe(child);
        expect(getNode(child.parentNode)).toBe(container);
        expect(realm.root.innerHTML).toBe('');
    });

    test('Element.prototype.remove should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.append(child);
        child.remove();
        expect(container.childNodes.length).toBe(0);
        expect(child.parentNode).toBe(null);
    });

    test('Element.prototype.remove should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        attachRealm(container);
        container.append(child);
        child.remove();
        expect(container.childNodes.length).toBe(0);
        expect(child.parentNode).toBe(null);
        expect(container.innerHTML).toBe('');
    });

    test('Element.prototype.children|childElementCount|firstElementChild|lastElementChild|previousElementSibling|nextElementSibling should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('div');
        const child3 = document.createElement('div');
        expect(container.childElementCount).toBe(0);
        expect(container.firstElementChild).toBe(null);
        expect(container.lastElementChild).toBe(null);
        container.append(child, child2, 'string', child3, 'test');
        expect(container.children.length).toBe(3);
        expect(container.children[0]).toBe(child);
        expect(container.children[1]).toBe(child2);
        expect(container.children[2]).toBe(child3);
        expect(container.childElementCount).toBe(3);
        expect(container.firstElementChild).toBe(child);
        expect(container.lastElementChild).toBe(child3);
        expect(child.previousElementSibling).toBe(null);
        expect(child2.previousElementSibling).toBe(child);
        expect(child3.previousElementSibling).toBe(child2);
        expect(child2.nextElementSibling).toBe(child3);
        expect(child3.nextElementSibling).toBe(null);
        expect(container.innerHTML).toBe('<div></div><div></div>string<div></div>test');
    });

    test('Element.prototype.children|childElementCount|firstElementChild|lastElementChild|previousElementSibling|nextElementSibling should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const child2 = document.createElement('div');
        const child3 = document.createElement('div');
        const realm = attachRealm(container);
        expect(container.childElementCount).toBe(0);
        expect(container.firstElementChild).toBe(null);
        expect(container.lastElementChild).toBe(null);
        container.append(child, child2, 'string', child3, 'test');
        expect(container.children.length).toBe(3);
        expect(container.children[0]).toBe(child);
        expect(container.children[1]).toBe(child2);
        expect(container.children[2]).toBe(child3);
        expect(container.childElementCount).toBe(3);
        expect(container.firstElementChild).toBe(child);
        expect(container.lastElementChild).toBe(child3);
        expect(child.previousElementSibling).toBe(null);
        expect(child2.previousElementSibling).toBe(child);
        expect(child3.previousElementSibling).toBe(child2);
        expect(child2.nextElementSibling).toBe(child3);
        expect(child3.nextElementSibling).toBe(null);
        expect(realm.root.innerHTML).toBe('');
    });

    test('Element.prototype.after should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.append(child);
        child.after('test');
        expect(container.childNodes.length).toBe(2);
        expect(container.lastChild.previousSibling).toBe(child);
        child.after('test2');
        expect(container.childNodes.length).toBe(3);
        expect(container.lastChild.previousSibling).toBe(container.firstChild.nextSibling);
    });

    test('Element.prototype.after should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const realm = attachRealm(container);
        container.append(child);
        child.after('test');
        expect(container.childNodes.length).toBe(2);
        expect(container.lastChild.previousSibling).toBe(child);
        child.after('test2');
        expect(container.childNodes.length).toBe(3);
        expect(container.lastChild.previousSibling).toBe(container.firstChild.nextSibling);
        expect(realm.root.innerHTML).toBe('');
    });

    test('Element.prototype.before should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.append(child);
        child.before('test');
        expect(container.childNodes.length).toBe(2);
        expect(container.firstChild.nextSibling).toBe(child);
        child.before('test2');
        expect(container.childNodes.length).toBe(3);
        expect(container.lastChild.previousSibling).toBe(container.firstChild.nextSibling);
    });

    test('Element.prototype.before should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const realm = attachRealm(container);
        container.append(child);
        child.before('test');
        expect(container.childNodes.length).toBe(2);
        expect(container.firstChild.nextSibling).toBe(child);
        child.after('test2');
        expect(container.childNodes.length).toBe(3);
        expect(container.lastChild.previousSibling).toBe(container.firstChild.nextSibling);
        expect(realm.root.innerHTML).toBe('');
    });

    test('Element.prototype.replaceWith should work as usual', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        container.append(child);
        child.replaceWith('test');
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe('test');
        expect(child.parentNode).toBe(null);
    });

    test('Element.prototype.replaceWith should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        attachRealm(container);
        container.append(child);
        child.replaceWith('test');
        expect(container.childNodes.length).toBe(1);
        expect(getNode(container.firstChild).textContent).toBe('test');
        expect(child.parentNode).toBe(null);
    });

    test('Element.prototype.innerHTML should work as usual', () => {
        const container = document.createElement('div');
        container.innerHTML = '<span class="test">test</span>';
        expect(container.innerHTML).toBe('<span class="test">test</span>');
        expect(container.textContent).toBe('test');
    });

    test('Element.prototype.textContent should work in realm', () => {
        const container = document.createElement('div');
        const child = document.createTextNode('test');
        const realm = attachRealm(container);
        container.appendChild(child);
        realm.root.append('pre', child, 'post');
        expect(child.textContent).toBe('test');
        expect(container.textContent).toBe('test');
        expect(realm.root.textContent).toBe('pretestpost');
        child.textContent = 'test2';
        expect(child.textContent).toBe('test2');
        expect(realm.root.childNodes[1].textContent).toBeNull();
    });

    test('Slotted elements are selectable', () => {
        const container = document.createElement('div');
        const child = document.createTextNode('test');
        container.append(child);
        attachRealm(container);
        const range = document.createRange();
        expect(() => range.selectNode(child)).not.toThrow();
    });
});
