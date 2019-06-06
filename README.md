# Nuxt Storyblok Router

[![Circle CI][circle-ci-src]][circle-ci-href]
[![Standard JS][standard-js-src]][standard-js-href]

> Nuxt.js module to use storyblok routes instead of pages/ directory

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Add the `nuxt-storyblok-router` dependency with `yarn` or `npm` to your project
2. Add `nuxt-storyblok-router` to the `modules` section of `nuxt.config.js`
3. Configure it:

```js
{
  modules: [
    'nuxt-storyblok-router',
  ],
  storyblokRouter: {
    version: 'draft',
    exclude: ['settings']
  },
}
```

## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) {{ author }}

<!-- Badges -->
[standard-js-src]: https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square
[standard-js-href]: https://standardjs.com