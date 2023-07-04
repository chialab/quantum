# Why Quantum

## About the name

Quantum is a mechanism to distinguish the hierarchical and semantic position of a node from its position in the rendered DOM. We could say that the same node is in two different positions at the same time until rendered, like, well, _quantum_ superposition.

## What is Quantum

Quantum is small library (< 5kb gzipped), dependencies free, that enrich the `Node` and `HTMLElement` prototypes in order to handle Realms, a space where component child nodes can be slotted without using Shadow DOM.

## What Quantum is not

Quantum is not a drop-in replacement for Shadow DOM. It is not a polyfill, it is not a shim, it is not a wrapper. It is a different approach to the same problem, with a very similar API.

Quantum is not a view library. It is a low-level library that can be used to create view libraries with light DOM slot support.

## Why not Shadow DOM

Shadow DOM is great for a great number of scenarios, but it lacks of some features that are required to create custom elements with specific semantic, accessibility and styling purposes:

-   doesn't work for most of the builtin elements
-   heavy style encapsulation (class utilities must be imported in each shadow root)
-   cannot decorate nor wrap slotted children
-   sometimes causes headaches when working with forms, accessibility tree, DOM traversing and events handling

:::info
Please note that some of the points above are not issues with the technology, indeed they are extremely useful for different uses cases.
:::
