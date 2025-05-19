# Custom Elements

Quantum is part of the DNA project and its design is largely connected to Custom Elements.

Quantum interface is similar to the Shadow DOM, in that it aims to offer the same developer experience but with a different technology.

## Define an element

In the example below, we define a custom element that uses a realm to render its internal template. We are going to use µhtml to render the template, but you can use any other view library.

```ts
import { attachRealm } from '@chialab/quantum';
import { html, render } from 'uhtml';

export class MyElement extends HTMLComponent {
    readonly realm = attachRealm(this);

    connectedCallback() {
        this.realm.observe(() => {
            // render internal template
            render(this.realm.root, html`<div class="my-element__wrapper"> ${this.childNodes} </div>`);
        });
    }
}

customElements.define('my-element', MyElement);
```

:::tip
Shadow DOM encapsulates styles, but Quantum does not. This is because Quantum render nodes in the light DOM, so you need a good styling strategy like CSS-in-JS or BEM to avoid collisions.
:::

## Customized built-in elements

Differently from Shadow DOM, we can use Quantum with built-in elements such as `<button>`, `<a>` and `<ul>`:

```ts
import { render, html } from 'uhtml';
import { attachRealm } from '@chialab/quantum';

export class MyButton extends HTMLButtonElement {
    readonly realm = attachRealm(this);
    icon = 'home';

    connectedCallback() {
        this.realm.observe(() => {
            // render internal template
            render(this.realm.root, html`
                <i class="button__icon">${this.icon}</i>
                <span class="button__label">${this.childNodes}</span>
            `));
        });
    }
}

customElements.define('my-button', MyButton, {
    extends: 'button',
});

```
