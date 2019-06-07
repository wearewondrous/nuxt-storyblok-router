# Nuxt Storyblok Router

[![NPM](https://img.shields.io/npm/v/@wearewondrous/nuxt-storyblok-router.svg)](https://www.npmjs.com/package/@wearewondrous/nuxt-storyblok-router)
[![CircleCI](https://circleci.com/gh/wearewondrous/nuxt-storyblok-router.svg?style=shield&circle-token=39cac53ced81c450bac89e8c5d24992899a7edb5)](https://circleci.com/gh/wearewondrous/nuxt-storyblok-router)
[![Standard JS][standard-js-src]][standard-js-href]

> Nuxt.js module to use storyblok routes instead of pages/ directory

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Add the `@wearewondrous/nuxt-storyblok-router` dependency with `yarn` or `npm` to your project
2. Add `@wearewondrous/nuxt-storyblok-router` to the `modules` section of `nuxt.config.js`
3. Configure it:

```js
{
  modules: [
    ['@wearewondrous/nuxt-storyblok-router', {
      // Module option here
    }]
  ]
}
```

### Using top level options

```js
{
  modules: [
    '@wearewondrous/nuxt-storyblok-router'
  ],
  storyblokRouter: [
    // Module options here
  ]
}
```

## Options

### `accessToken`

- Default: `this.options.storyblok || ''`

Access Token for the StoryBlok API. Not needed if you already have installed the [Storyblok Nuxt.js module](https://github.com/storyblok/storyblok-nuxt)  

### `version`

- Default: `'published'`

Version of the Storyblok Content. Use 'draft' for the preview Access Token.

### `defaultLanguage`

- Default: `''`

Optional. If your Storyblok Site has multiple languages, set `defaultLanguage` to the key of your Storyblok default language.

### `exclude`

- Default: `[]`

Optional. Array of pages which shoud not be rendered. (e.g. `settings`)


## Usage

When enabled, this module will disable the traditional Nuxt router. The Router file will be generated according to your Storyblok Routes. 

### Content Types

In Storyblok all pages need a [Content Type](https://www.storyblok.com/docs/Guides/root-blocks).

1. Create a Content Type in Storyblok.
2. Create a Vue Component with the same name, which will act as a Content Type, in the `pages/` directory. These Components have all the native nuxt featutes like asyncData, fetch, head, etc.

> Tip: Use camelCase for the naming in Storyblok and PascalCase for your Component Naming. 

#### Usage with [nuxt-storyblok-queries](https://github.com/wearewondrous/nuxt-storyblok-queries) (Recommended)
```html
// pages/PageGeneric.vue

<template>
  <!-- Your template -->
</template>

<script>
export default {
  async asyncData({ app }) {
    const story = await $storyblok.getCurrentStory()

    return {
      story
    }
  }
}
</script>
```

#### Usage with [storyblok-nuxt](https://github.com/storyblok/storyblok-nuxt)
```html
// pages/PageGeneric.vue

<template>
  <!-- Your template -->
</template>

<script>
export default {
  async asyncData({ app, route }) {
    const story = await app.$storyapi.get(`cdn/stories/${route.path}`)

    return {
      story
    }
  }
}
</script>
```

### Languages

The Router will automaticly detect if you use multiple language. If you have multiple languages, the router will use an optional [dynamic parameter](https://router.vuejs.org/guide/essentials/dynamic-matching.html) on each route.
The dynamic parameter is optional, so if no language is specified the default languag can be used.

```js
const router = new VueRouter({
  routes: [
    // dynamic segments start with a colon
    { path: '/:lang?/about', component: ContentType }
  ]
})
```


## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) [WONDROUS LTD](https://www.wearewondrous.com/)

<!-- Badges -->
[standard-js-src]: https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square
[standard-js-href]: https://standardjs.com