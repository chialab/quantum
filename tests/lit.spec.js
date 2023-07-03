import { html, render } from 'lit';
import { test, describe, expect } from 'vitest';
import './CustomElement.js';

describe('Lit', () => {
    test('should update text content', () => {
        const Template = (text) => html`<custom-element>${text}</custom-element>`;
        const container = document.createElement('div');
        render(Template('Text'), container);
        const element = container.children[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(2);
        expect(element.childNodes.length).toBe(2);
        expect(element.parentNode).toBe(container);
        expect(element.childNodes[1].parentNode).toBe(element);
        expect(element.childNodes[1].textContent).toBe('Text');
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$')).toBe(
            '<!----><custom-element><span><!--?lit$-->Text</span><div></div></custom-element>'
        );

        render(Template('Update'), container);
        expect(container.childNodes.length).toBe(2);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(2);
        expect(element.childNodes[1].textContent).toBe('Update');
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$')).toBe(
            '<!----><custom-element><span><!--?lit$-->Update</span><div></div></custom-element>'
        );
    });

    test('should update text content with multiple text nodes', () => {
        const Template = (text) => html`<custom-element>${text} ${'children'}</custom-element>`;
        const container = document.createElement('div');
        render(Template('Text'), container);
        const element = container.children[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(2);
        expect(element.parentNode).toBe(container);
        expect(element.childNodes.length).toBe(5);
        expect(element.childNodes[1].parentNode).toBe(element);
        expect(element.childNodes[1].textContent).toBe('Text');
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$')).toBe(
            '<!----><custom-element><span><!--?lit$-->Text <!--?lit$-->children</span><div></div></custom-element>'
        );

        render(Template('Update'), container);
        expect(container.childNodes.length).toBe(2);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(5);
        expect(element.childNodes[1].textContent).toBe('Update');
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$')).toBe(
            '<!----><custom-element><span><!--?lit$-->Update <!--?lit$-->children</span><div></div></custom-element>'
        );
    });

    test('should update named slots', () => {
        const Template = (title) => html`<custom-element>
            Text ${title ? html`<h1 slot="children">Title</h1>` : html`<h2 slot="children">Subtitle</h2>`}
        </custom-element>`;
        const container = document.createElement('div');
        render(Template(true), container);
        const element = container.children[0];
        const textNode = element.childNodes[0];
        const lastNode = element.childNodes[3];
        element.connectedCallback();

        expect(element.childNodes.length).toBe(4);
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$').replace(/\n\s+/g, '')).toBe(
            '<!----><custom-element><span>Text <!--?lit$--></span><div><h1 slot="children">Title</h1></div></custom-element>'
        );

        render(Template(false), container);
        expect(element.childNodes.length).toBe(4);
        expect(element.childNodes[0]).toBe(textNode);
        expect(element.childNodes[3]).toBe(lastNode);
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$').replace(/\n\s+/g, '')).toBe(
            '<!----><custom-element><span>Text <!--?lit$--></span><div><h2 slot="children">Subtitle</h2></div></custom-element>'
        );
    });
});
