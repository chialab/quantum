# Usage

Once installed, you can import the library as ES module:

```js
import { attachRealm } from '@chialab/quantum';
```

:::warning
Quantum mutates `Node` and `HTMLElement` prototype methods at import time. Generally, this operation does not impact the usability and performance of the DOM.
:::

## Create a Realm

A realm is a DOM context that can be used to create and manage DOM nodes. A realm is created using the `attachRealm` function:

```js
import { attachRealm } from '@chialab/quantum';

const root = document.createElement('div');
const realm = attachRealm(root);
```

:::info
During realm creation, root's child nodes are removed from the DOM and appendend to the realm.
:::

A realm can be observed for mutations using the `observe` method:

```js
realm.observe((mutations) => {
    console.log('Added:', mutations.addedNodes);
    console.log('Removed:', mutations.removedNodes);
});
```

During the observe cycle, the realm is "open". It means that nodes can be appended to the root node and they will be regularly rendered by the browser.

At this time, you can use a generic view library to render the internal template of the component. In the example below, we use [uhtml](https://github.com/WebReflection/uhtml) because it natively support Node instances:

```js
import { render, html } from 'uhtml';
import { attachRealm } from '@chialab/quantum';

const root = document.createElement('div');
const realm = attachRealm(root);

realm.observe(() => {
    // render internal template
    render(realm.root, html`<ul>
        ${realm.childNodes}
    </ul>`);
});

// append slotted items
render(root, html`
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
    <li>Item 4</li>
    <li>Item 5</li>
`);
```
