import { h, render } from 'preact';
import { test, describe, expect } from 'vitest';
import './CustomElement.js';

describe('Lit', () => {
    test('should update text content', () => {
        const Template = (text) => h('custom-element', null, [text]);
        const container = document.createElement('div');

        render(Template('Text'), container);

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(1);
        expect(element.childNodes.length).toBe(1);
        expect(element.parentNode).toBe(container);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe('<custom-element><span>Text</span><div></div></custom-element>');

        render(Template('Update'), container);

        expect(container.childNodes.length).toBe(1);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(1);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe('<custom-element><span>Update</span><div></div></custom-element>');
    });

    test('should update text content with multiple text nodes', () => {
        const Template = (text) => h('custom-element', null, [text, ' ', 'children']);
        const container = document.createElement('div');

        render(Template('Text'), container);

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(1);
        expect(element.parentNode).toBe(container);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe('<custom-element><span>Text children</span><div></div></custom-element>');

        render(Template('Update'), container);

        expect(container.childNodes.length).toBe(1);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe('<custom-element><span>Update children</span><div></div></custom-element>');
    });

    test('should update named slots', () => {
        const Template = (title) =>
            h('custom-element', null, [
                'Text ',
                title
                    ? h('h1', { slot: 'children', key: 1 }, 'Title')
                    : h('h2', { slot: 'children', key: 2 }, 'Subtitle'),
                '\n',
            ]);
        const container = document.createElement('div');

        render(Template(true), container);

        const element = container.children[0];
        const textNode = element.childNodes[0];
        const lastNode = element.childNodes[2];
        element.connectedCallback();

        expect(element.childNodes.length).toBe(3);
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text \n</span><div><h1 slot="children">Title</h1></div></custom-element>'
        );

        render(Template(false), container);

        expect(element.childNodes.length).toBe(3);
        expect(element.childNodes[0]).toBe(textNode);
        expect(element.childNodes[2]).toBe(lastNode);
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text \n</span><div><h2 slot="children">Subtitle</h2></div></custom-element>'
        );
    });
});
