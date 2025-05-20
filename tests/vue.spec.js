import { describe, expect, test } from 'vitest';
import * as Vue from 'vue';
import './components/CustomElement.js';

describe('Vue', () => {
    test('should update text content', async () => {
        const container = document.createElement('div');
        const app = Vue.createApp({
            data() {
                return {
                    text: 'Text',
                };
            },
            render() {
                return Vue.h('custom-element', {}, [this.text]);
            },
            methods: {
                updateText(value) {
                    this.text = value;
                },
            },
        });
        app.mount(container);

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(1);
        expect(element.childNodes.length).toBe(1);
        expect(element.parentNode).toBe(container);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );

        app._instance.proxy.updateText('Update');
        await Vue.nextTick();

        expect(container.childNodes.length).toBe(1);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(1);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Update<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );
    });

    test('should update text content with multiple text nodes', async () => {
        const container = document.createElement('div');
        const app = Vue.createApp({
            data() {
                return {
                    text: 'Text',
                };
            },
            render() {
                return Vue.h('custom-element', {}, [
                    this.text,
                    ' ',
                    'children',
                ]);
            },
            methods: {
                updateText(value) {
                    this.text = value;
                },
            },
        });
        app.mount(container);

        const element = container.children[0];
        const textNode = element.childNodes[0];
        element.connectedCallback();

        expect(container.childNodes.length).toBe(1);
        expect(element.parentNode).toBe(container);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.parentNode).toBe(element);
        expect(textNode.textContent).toBe('Text');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text children<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );

        app._instance.proxy.updateText('Update');
        await Vue.nextTick();

        expect(container.childNodes.length).toBe(1);
        expect(container.children[0]).toBe(element);
        expect(element.childNodes.length).toBe(3);
        expect(textNode.textContent).toBe('Update');
        expect(container.innerHTML).toBe(
            '<custom-element><span>Update children<!--isµ0--></span><div><!--isµ1--></div></custom-element>'
        );
    });

    test('should update named slots', async () => {
        const container = document.createElement('div');
        const app = Vue.createApp({
            data() {
                return {
                    title: true,
                };
            },
            render() {
                return Vue.h('custom-element', {}, [
                    'Text ',
                    this.title
                        ? Vue.h('h1', { slot: 'children' }, 'Title')
                        : Vue.h('h2', { slot: 'children' }, 'Subtitle'),
                    '\n',
                ]);
            },
            methods: {
                updateTitle(value) {
                    this.title = value;
                },
            },
        });
        app.mount(container);

        const element = container.children[0];
        const textNode = element.childNodes[0];
        const lastNode = element.childNodes[2];
        element.connectedCallback();

        expect(element.childNodes.length).toBe(3);
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text \n<!--isµ0--></span><div><h1 slot="children">Title</h1><!--isµ1--></div></custom-element>'
        );

        app._instance.proxy.updateTitle(false);
        await Vue.nextTick();

        expect(element.childNodes.length).toBe(3);
        expect(element.childNodes[0]).toBe(textNode);
        expect(element.childNodes[2]).toBe(lastNode);
        expect(container.innerHTML).toBe(
            '<custom-element><span>Text \n<!--isµ0--></span><div><h2 slot="children">Subtitle</h2><!--isµ1--></div></custom-element>'
        );
    });
});
