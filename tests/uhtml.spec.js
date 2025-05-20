import { html, render } from 'uhtml';
import { describe, expect, test } from 'vitest';
import './components/CustomElement.js';

describe('uhtml', () => {
    test('should update text content', () => {
        const Template = (text) =>
            html`<custom-element>${text}</custom-element>`;
        const container = document.createElement('div');

        render(container, Template('Text'));

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(1);
        expect(element.childNodes.length).toBe(2);
        expect(element.parentNode).toBe(container);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text<!--isµ0--><!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );

        render(container, Template('Update'));

        expect(container.childNodes.length).toBe(1);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(2);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Update<!--isµ0--><!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );
    });

    test('should update text content with multiple text nodes', () => {
        const Template = (text) =>
            html`<custom-element>${text} children</custom-element>`;
        const container = document.createElement('div');

        render(container, Template('Text'));

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(1);
        expect(element.parentNode).toBe(container);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML.replace(/\n\s+/g, '')).toBe(
            '<custom-element><span>Text<!--isµ0--> children<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );

        render(container, Template('Update'));

        expect(container.childNodes.length).toBe(1);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Update<!--isµ0--> children<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );
    });

    test('should update named slots', () => {
        const Template = (title) =>
            html`<custom-element>
                Text ${title ? html`<h1 slot="children">Title</h1>` : html`<h2 slot="children">Subtitle</h2>`}
            </custom-element>`;
        const container = document.createElement('div');

        render(container, Template(true));

        const element = container.children[0];
        const textNode = element.childNodes[0];
        const lastNode = element.childNodes[2];
        element.connectedCallback();

        expect(element.childNodes.length).toBe(4);
        expect(container.innerHTML.replace(/\n\s+/g, '')).toBe(
            '<custom-element><span>Text <!--isµ0--><!--isµ0--></span><div><h1 slot="children">Title</h1><!--isµ1--></div></custom-element>'
        );

        render(container, Template(false));

        expect(element.childNodes.length).toBe(4);
        expect(element.childNodes[0]).toBe(textNode);
        expect(element.childNodes[2]).toBe(lastNode);
        expect(container.innerHTML.replace(/\n\s+/g, '')).toBe(
            '<custom-element><span>Text <!--isµ0--><!--isµ0--></span><div><h2 slot="children">Subtitle</h2><!--isµ1--></div></custom-element>'
        );
    });
});
