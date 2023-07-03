---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Quantum DOM"
  text: ""
  tagline: "A light DOM implementation of the <slot> element to be used across frameworks."
  image:
    src: https://raw.githubusercontent.com/chialab/dna/main/logo.svg
    alt: DNA logo
  actions:
    - theme: brand
      text: Get started
      link: /guide
    - theme: alt
      text: Features
      link: /features
    - theme: alt
      text: Why Quantum
      link: /design

features:
  - title: Small footprint
    details: The library is less than 5kb in production with very little impact on performance.
    icon:
      src: ./assets/leaf.svg

  - title: Cross framework
    details: Quantum is designed to work with any view framework and tested across Lit, Vue, React and Preact.
    icon:
      src: ./assets/brick.svg

  - title: Custom Elements friendly
    details: Combine Quantum with Custom Elements to build Web Components without Shadow DOM constraints.
    icon:
      src: ./assets/heart-handshake.svg
---
