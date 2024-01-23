import { extend } from './extend.js';

export { extend };
export { extendNode } from './Node.js';
export { extendElement } from './Element.js';
export { extendTreeWalker } from './TreeWalker.js';
export {
    Realm,
    attachRealm,
    getRealm,
    dangerouslyOpenRealms,
    dangerouslyCloseRealms,
    dangerouslyEnterRealms,
} from './Realm.js';

if (typeof window !== 'undefined') {
    extend(window);
}
