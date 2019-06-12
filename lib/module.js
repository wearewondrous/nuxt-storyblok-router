const { resolve } = require('path')
const StoryblokClient = require('storyblok-js-client')
const uniq = require('lodash/uniq')
const { pascalCase, normalizeName, isExcluded } = require('./utils')
const logger = require('./logger')

export default async function storyblokRouterModule(moduleOptions) {
  const defaultOptions = {
    accessToken: '',
    version: 'published',
    defaultLanguage: '',
    disabled: false,
    exclude: [],
    sitemap: false
  }

  const options = Object.assign(
    defaultOptions,
    this.options.storyblok,
    this.options.storyblokRouter,
    moduleOptions
  )

  if (options.disabled) {
    logger.warn('Module Disabled')
    return
  }

  // Check if accessToken is defined
  if (!options.accessToken) {
    logger.warn('No Access Token found in Module Options')
    return
  }

  const client = new StoryblokClient({
    accessToken: options.accessToken
  })

  const space = await client.get('cdn/spaces/me')

  const { language_codes: languageCodes = [] } = space.data.space

  if (languageCodes.length && options.defaultLanguage) {
    languageCodes.unshift(options.defaultLanguage)
  }

  let total = 0
  let page = 0
  const pages = []
  const perPage = 5

  while (!total || total > page * perPage) {
    page = page + 1
    const response = await client.get('cdn/stories', {
      version: options.version,
      per_page: perPage,
      page
    })

    pages.push(...response.data.stories)
    total = response.total
  }

  const components = []
  const langPrefix = languageCodes.length > 0 ? '/:lang?' : ''

  const routes = pages.map((story) => {
    if (isExcluded(story.full_slug, options.exclude)) {
      return false
    }

    const component = pascalCase(story.content.component)
    components.push(component)

    const name =
      story.full_slug === 'home' ? 'index' : normalizeName(story.full_slug)
    const slug = `${langPrefix}${
      story.full_slug === 'home' ? '' : '/' + story.full_slug
    }`

    return {
      name,
      slug,
      component
    }
  })

  const filteredRoutes = routes.filter(Boolean)

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'router.js',
    options: {
      routes: filteredRoutes,
      components: uniq(components)
    }
  })

  const dynamicRoutes = []
  pages.forEach((story) => {
    if (isExcluded(story.full_slug, options.exclude)) {
      return false
    }

    dynamicRoutes.push({
      route: story.full_slug === 'home' ? '/' : '/' + story.full_slug,
      payload: null
    })

    languageCodes.forEach((lang) => {
      dynamicRoutes.push({
        route: `/${lang}${
          story.full_slug === 'home' ? '' : '/' + story.full_slug
        }`,
        payload: null
      })
    })
  })

  this.nuxt.hook('generate:extendRoutes', (routes) => {
    routes.splice(0, routes.length)
    routes.push(...dynamicRoutes)
  })

  // Sitemap integration
  if (options.sitemap) {
    if (typeof options.sitemap !== 'object') {
      options.sitemap = {}
    }
    const sitemapOptions = {
      ...options.sitemap,
      routes: dynamicRoutes.map(route => route.route)
    }
    this.requireModule([
      '@nuxtjs/sitemap',
      sitemapOptions
    ])
  }

  // Disable parsing `pages/`
  this.nuxt.hook('build:before', () => {
    this.nuxt.options.build.createRoutes = () => {
      return []
    }
  })
}

module.exports.meta = require('../package.json')
