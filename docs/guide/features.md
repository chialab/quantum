# Features

## Named slots

Quantum supports named slots. Named slots can be used to define the correct render position of a child element.

```tsx
<my-button>
    Click me
    <svg slot="icon"><svg>
</my-button>
```

## Child wrapping

Thanks to the programmatic access to the realm children, it is possibile to wrap every child into its own element, even for named slots. This is useful for styling purposes and/or to decorate slotted children.

```ts
render(
    realm.root,
    html`<ul>
        ${element.childNodes.map((child) => html` <li>${child}</li> `)}
    </ul>`
);
```

## Compatibility

Quantum works at a very low level mutating `Node` and `HTMLElement` prototypes. This should ensure a high level of interoperability with other view libraries.
Also, the test suite includes integration specs with major frameworks and libraries: **Lit**, **React**, **Preact**, **Vue**, **Svelte** and **µhtml**.

## Builtin elements support

Realms can be created even where shadow DOM is not supported, like in the case of builtin elements.

```ts
import { attachRealm } from '@chialab/quantum';

class Button extends HTMLButtonElement {
    readonly realm = attachRealm(this);
}
```
