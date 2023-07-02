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
});
