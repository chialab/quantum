import { render, cleanup } from '@testing-library/svelte';
import { test, describe, expect, afterEach } from 'vitest';
import Test1 from './components/Test1.svelte';
import Test2 from './components/Test2.svelte';
import Test3 from './components/Test3.svelte';

describe('Svelte', () => {
    afterEach(cleanup);

    test('should update text content', async () => {
        const { component, container: body } = render(Test1, {
            props: {
                text: 'Text',
            },
        });

        const container = body.children[0];
        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(2);
        expect(element.childNodes.length).toBe(1);
        expect(element.parentNode).toBe(container);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text<!--isµ0--></span><div><!--isµ1--></div></custom-element><!--<Test1>-->'
        );

        await component.$set({ text: 'Update' });

        expect(container.childNodes.length).toBe(2);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(1);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Update<!--isµ0--></span><div><!--isµ1--></div></custom-element><!--<Test1>-->'
        );
    });

    test('should update text content with multiple text nodes', async () => {
        const { component, container: body } = render(Test2, {
            props: {
                text: 'Text',
            },
        });

        const container = body.children[0];
        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(2);
        expect(element.parentNode).toBe(container);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text children<!--isµ0--></span><div><!--isµ1--></div></custom-element><!--<Test2>-->'
        );

        await component.$set({ text: 'Update' });

        expect(container.childNodes.length).toBe(2);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML.replace(/\n\s+/g, ' ')).toBe(
            '<custom-element><span>Update children<!--isµ0--></span><div><!--isµ1--></div></custom-element><!--<Test2>-->'
        );
    });

    test('should update named slots', async () => {
        const { component, container: body } = render(Test3, {
            props: {
                title: true,
            },
        });
        const container = body.children[0];
        const element = container.children[0];
        const textNode = element.childNodes[0];
        const lastNode = element.childNodes[2];
        element.connectedCallback();

        expect(element.childNodes.length).toBe(3);
        expect(container.innerHTML.replace(/\n\s+/g, ' ')).toBe(
            '<custom-element><span>Text end<!--isµ0--></span><div><h1 slot="children">Title</h1><!--isµ1--></div></custom-element><!--<Test3>-->'
        );

        await component.$set({ title: false });

        expect(element.childNodes.length).toBe(3);
        expect(element.childNodes[0]).toBe(textNode);
        expect(element.childNodes[2]).toBe(lastNode);
        expect(container.innerHTML.replace(/\n\s+/g, ' ')).toBe(
            '<custom-element><span>Text end<!--isµ0--></span><div><h2 slot="children">Subitle</h2><!--isµ1--></div></custom-element><!--<Test3>-->'
        );
    });
});
