import { Ivya } from 'ivya';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { attachRealm } from '../src/index.js';

describe('Compatibility with other libraries', () => {
    describe('ivya', () => {
        const ivya = Ivya.create({
            browser: 'chromium',
            testIdAttribute: 'data-test-id',
        });

        describe('should correctly create locator selectors', () => {
            let container;
            beforeEach(() => {
                container = document.createElement('div');
                document.body.appendChild(container);
            });
            afterEach(() => {
                container.remove();
            });

            test('simple', () => {
                const element = document.createElement('div');
                container.appendChild(element);

                const selector = ivya.generateSelectorSimple(element);

                expect(selector).toBe('div >> nth=1');
                expect(ivya.queryLocatorSelector(selector)).toBe(element);
            });

            test('simple text', () => {
                const element = document.createElement('span');
                element.textContent = 'Text';
                container.appendChild(element);

                const selector = ivya.generateSelectorSimple(element);

                expect(selector).toBe('internal:text="Text"i');
                expect(ivya.queryLocatorSelector(selector)).toBe(element);
            });

            test.only('simple realm', () => {
                const element = document.createElement('div');
                const realm = attachRealm(element);
                container.appendChild(element);
                element.textContent = 'Text';
                realm.root.appendChild(document.createTextNode('Internal'));

                const selector = ivya.generateSelectorSimple(element);
                expect(selector).toBe('internal:text="Internal"i');
                expect(ivya.queryLocatorSelector(selector)).toBe(element);
            });

            test('simple realm with slot', () => {
                const element = document.createElement('div');
                const realm = attachRealm(element);
                container.appendChild(element);
                element.textContent = 'Text';
                realm.root.appendChild(document.createTextNode('Internal'));
                realm.root.appendChild(element.firstChild);

                const selector = ivya.generateSelectorSimple(element);
                expect(selector).toBe('internal:text="Internal"i');
                expect(ivya.queryLocatorSelector(selector)).toBe(element);
            });
        });
    });
});
