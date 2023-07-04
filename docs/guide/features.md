# Features

## Programmatic

## Child wrapping

Thanks to the programmatic access to the realm children, it is possibile to wrap every child into its own element. This is useful for styling purposes and/or to decorate slotted children.

```ts
render(realm.root, html`<ul>
    ${real.childNodes.map((child) => html`
        <li>${child}</li>
    `)}
</ul>`);
```

## Compatibility

Quantum works at a very low level mutating `Node` and `HTMLElement` prototypes. This should ensure a high level of interoperability with other view libraries.
Also, the test suite includes integration specs with major frameworks and libraries: **Lit**, **React**, **Preact**, **Vue**, **Svelte** and **µhtml**.

## Easier styling

## Builtin elements support
