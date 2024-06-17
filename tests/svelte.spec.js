import { render } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';
import Test1 from './components/Test1.svelte';
import Test2 from './components/Test2.svelte';
import Test3 from './components/Test3.svelte';

describe('Svelte', () => {
    test('should update text content', async () => {
        const { container, rerender } = render(Test1, {
            props: {
                text: 'Text',
            },
        });

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(2);
        expect(element.childNodes.length).toBe(1);
        expect(element.parentNode).toBe(container);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );

        await rerender({ text: 'Update' });

        expect(container.childNodes.length).toBe(2);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(1);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Update<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );
    });

    test('should update text content with multiple text nodes', async () => {
        const { container, rerender } = render(Test2, {
            props: {
                text: 'Text',
            },
        });

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(2);
        expect(element.parentNode).toBe(container);
        expect(element.childNodes.length).toBe(1);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text children');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text children<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );

        await rerender({ text: 'Update' });

        expect(container.childNodes.length).toBe(2);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(1);
        expect(textNode.textContent).toBe('Update children');
        expect(container.innerHTML.replace(/\n\s+/g, ' ')).toBe(
            '<custom-element><span>Update children<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );
    });

    test('should update named slots', async () => {
        const { container, rerender } = render(Test3, {
            props: {
                title: true,
            },
        });
        const element = container.children[0];
        const textNode = element.childNodes[0];
        const lastNode = element.childNodes[2];
        element.connectedCallback();

        expect(element.childNodes.length).toBe(4);
        expect(container.innerHTML.replace(/\n\s+/g, ' ')).toBe(
            '<custom-element><span>Text <!----> end<!--isµ0--></span><div><h1 slot="children">Title</h1><!--isµ1--></div></custom-element>'
        );

        await rerender({ title: false });

        expect(element.childNodes.length).toBe(4);
        expect(element.childNodes[0]).toBe(textNode);
        expect(element.childNodes[2]).toBe(lastNode);
        expect(container.innerHTML.replace(/\n\s+/g, ' ')).toBe(
            '<custom-element><span>Text <!----> end<!--isµ0--></span><div><h2 slot="children">Subitle</h2><!--isµ1--></div></custom-element>'
        );
    });
});
