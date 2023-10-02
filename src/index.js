import { extend } from './extend.js';

export { extend };
export { Realm, attachRealm, getRealm } from './Realm.js';

if (typeof window !== 'undefined') {
    extend(window);
}
