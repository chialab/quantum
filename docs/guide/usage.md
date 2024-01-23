# Usage

## Importing

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

At this time, you can use a generic view library to render the internal template of the component. In the example below, we use [µhtml](https://github.com/WebReflection/uhtml) because it natively support Node instances:

```js
import { attachRealm } from '@chialab/quantum';
import { html, render } from 'uhtml';

const root = document.createElement('div');
const realm = attachRealm(root);

realm.observe(() => {
    // render internal template
    render(
        realm.root,
        html`<ul>
            ${realm.childNodes}
        </ul>`
    );
});

// append slotted items
render(
    root,
    html`
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>Item 4</li>
        <li>Item 5</li>
    `
);
```

:::details
The `realm.root` property is a Proxy of the original root node. Properties set during the observe cycle are not applied to the original node, so you can invoke the `render` function without any side effect and context mixing.
:::

## Named slots

Named slots can be used to define the correct render position of a child element.

```tsx
render(
    realm.root,
    html`<div class="card">
        <div class="card-header">
            <div class="card-avatar"> ${realm.childNodesBySlot('avatar')} </div>
            ${realm.childNodesBySlot('heading')}
        </div>
        ${realm.childNodes}
    </div>`
);
```

## Using `innerHTML`

The `innerHTML` property is not automatically supported by Quantum DOM shims. If you are updating the `innerHTML` property of a realm root, you need to manually invoke the `realm.initialize()` method in order to update the realm child nodes list:

```js
const root = document.createElement('div');
const realm = attachRealm(root);

root.innerHTML = '<p>Hello World</p>';
realm.initialize();
```

## Realm API

A realm instance exposes the following methods and properties:

#### `realm.node`

The original root node.

#### `realm.root`

The root node proxy for internal rendering.

#### `realm.childNodes`

The child nodes of the realm.

#### `realm.open`

Whether the realm is open or not.

#### `realm.initialize()`

Initialize the realm child nodes list by removing from the DOM all the child nodes of the root node.

#### `realm.observe(callback)`

Observe the realm for mutations. The callback is invoked with a `MutationRecord` array.

```ts
type MutationRecord = {
    addedNodes: Node[];
    removedNodes: Node[];
    previousSibling: Node | null;
    nextSibling: Node | null;
};
```

#### `realm.unobserve(callback)`

Stop observing the realm for mutations.

#### `realm.requestUpdate(callback)`

Request an internal update of the realm. The realm get opened and the callback is invoked. Once the callback is completed, the realm get closed again. It is useful to perform an internal realm rendering.

#### `realm.getPreviousSibling(node)`

Get the previous sibling of a node in the realm.

#### `realm.getNextSibling(node)`

Get the next sibling of a node in the realm.

#### `realm.append(...nodes)`

Append nodes to the realm.

#### `realm.prepend(...nodes)`

Prepend nodes to the realm.

#### `realm.remove(...nodes)`

Remove nodes from the realm.

#### `realm.replaceWith(oldNode, ...nodes)`

Replace a node with other nodes in the realm.

#### `realm.insertBefore(referenceNode, ...nodes)`

Insert nodes before a reference node in the realm.

#### `realm.insertAdjacentElement(position, node)`

Insert node at given position in the realm.

#### `realm.childNodesBySlot(name?: string)`

Get the child nodes of the realm filtered by slot name. If no name is provided, it will provide children with undeclared slot.

## Global methods

The library provide some global methods to manage all realms at once. They are useful to perform global operations like accessibility checks or other tasks that need to access the full DOM tree.

#### `dangerouslyEnterRealms(callback)`

Open all realms and invoke the callback. Once the callback is completed, all realms get closed again.

```ts
import { dangerouslyEnterRealms } from '@chialab/quantum';
import { run } from 'axe-core';

const results = await dangerouslyEnterRealms(() => run(document));
```

#### `dangerouslyOpenRealms`

Open all realms.

#### `dangerouslyCloseRealms`

Close all realms.
