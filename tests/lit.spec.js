import { html, render } from 'lit';
import { test, describe, expect } from 'vitest';
import './CustomElement.js';

describe('Lit', () => {
    test('should update text content', async () => {
        const Template = (text) => html`<custom-element>${text}</custom-element>`;
        const container = document.createElement('div');
        render(Template('Text'), container);

        expect(container.childNodes.length).toBe(2);
        const element = container.childNodes[1];
        const textNode = element.childNodes[1];
        expect(textNode.textContent).toBe('Text');
        expect(textNode.parentNode).toBe(element);
        expect(element.parentNode).toBe(container);
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$')).toBe(
            '<!----><custom-element><span><!--?lit$-->Text</span><div></div></custom-element>'
        );

        render(Template('Text update'), container);
        expect(container.childNodes.length).toBe(2);
        expect(container.childNodes[1]).toBe(element);
        expect(container.childNodes[1].textContent).toBe('Text update');
        expect(container.childNodes[1].parentNode).toBe(container);
        expect(container.innerHTML.replace(/\?lit\$\d+\$/g, '?lit$')).toBe(
            '<!----><custom-element><span><!--?lit$-->Text update</span><div></div></custom-element>'
        );
    });

    // test('should update text content with multiple text nodes', async () => {
    //     const container = document.createElement('div');
    //     attachRealm(container);
    //     render(html`<span>${'Text'} ${'children'}</span>`, container);

    //     expect(container.children.length).toBe(1);
    //     expect(container.children[0].textContent).toBe('Text children');
    //     expect(container.children[0].childNodes.length).toBe(5);

    //     render(html`<span>${'Update'} ${'children'}</span>`, container);
    //     expect(container.children.length).toBe(1);
    //     expect(container.children[0].textContent).toBe('Update children');
    //     expect(container.children[0].childNodes.length).toBe(5);
    // });

    // test('should update named slots', () => {
    //     const Template = (title) => lit.html`<test-element-integration>
    //         Text
    //         ${title ? lit.html`<h1 slot="children">Title</h1>` : lit.html`<h2 slot="children">Subtitle</h2>`}
    //     </test-element-integration>`;
    //     lit.render(Template(true), wrapper);
    //     const element = wrapper.children[0];

    //     expect(element.children[0].tagName).toBe('SPAN');
    //     expect(element.children[0].textContent.trim()).toBe('Text');
    //     expect(element.children[1].tagName).toBe('DIV');
    //     expect(element.children[1].children).to.have.lengthOf(1);
    //     expect(element.children[1].children[0].tagName).toBe('H1');
    //     expect(element.children[1].children[0].textContent.trim()).toBe('Title');

    //     lit.render(Template(false), wrapper);
    //     expect(element.children[0].tagName).toBe('SPAN');
    //     expect(element.children[0].textContent.trim()).toBe('Text');
    //     expect(element.children[1].tagName).toBe('DIV');
    //     expect(element.children[1].children).to.have.lengthOf(1);
    //     expect(element.children[1].children[0].tagName).toBe('H2');
    //     expect(element.children[1].children[0].textContent.trim()).toBe('Subtitle');
    // });

    // test('should update a textual property', () => {
    //     const Template = (value) => lit.html`<test-element-integration prop=${value}></test-element-integration>`;
    //     lit.render(Template('value'), wrapper);
    //     const element = wrapper.children[0];

    //     expect(element.prop).toBe('value');
    //     expect(element.children[2].tagName).toBe('P');
    //     expect(element.children[2].textContent).toBe('value');

    //     lit.render(Template('value update'), wrapper);
    //     expect(element.prop).toBe('value update');
    //     expect(element.children[2].tagName).toBe('P');
    //     expect(element.children[2].textContent).toBe('value update');
    // });

    // test('should update a ref property', () => {
    //     const Template = () =>
    //         lit.html`<test-element-integration .ref=${{ title: 'Title' }}></test-element-integration>`;
    //     lit.render(Template(), wrapper);
    //     const element = wrapper.children[0];

    //     expect(element.ref).to.be.a('object');
    //     expect(element.children[2].tagName).toBe('P');
    //     expect(element.children[2].textContent).toBe('Title');
    // });
});
