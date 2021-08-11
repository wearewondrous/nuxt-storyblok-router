const StoryblokClient = require('storyblok-js-client')
const uniqBy = require('lodash/uniqBy')
const {
  pascalCase,
  normalizeName,
  isExcluded,
  addTrailingSlash,
  stripTrailingSlash
} = require('./utils')
const logger = require('./logger')

export default async function storyblokRouterModule (moduleOptions) {
  const defaultOptions = {
    accessToken: '',
    version: 'published',
    contentTypeDir: 'pages',
    defaultLanguage: '',
    disabled: false,
    exclude: [],
    sitemap: false,
    generateDefaultPaths: false,
    useFallback: false,
    trailingSlash: true
  }

  const options = {
    ...defaultOptions,
    ...this.options.storyblok,
    ...this.options.storyblokRouter,
    ...moduleOptions
  }

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
  } else {
    options.generateDefaultPaths = true
  }

  let total = 0
  let page = 0
  const pages = []
  const perPage = 25

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

  const langPrefix = languageCodes.length > 0 ? '/:lang([a-z]{2})?' : ''

  const routes = pages.map((story) => {
    const fullSlug = stripTrailingSlash(String(story.full_slug))

    if (isExcluded(fullSlug, options.exclude)) {
      return false
    }

    const component = pascalCase(story.content.component)

    const isFrontpage = fullSlug === 'home'

    const name = isFrontpage ? 'index' : normalizeName(fullSlug)
    const slug = isFrontpage ? '' : `/${fullSlug}`
    const path = `${langPrefix}${slug}`

    let alias = []

    if (!isFrontpage) {
      alias = languageCodes.map((lang) => {
        const translatedSlug = story.translated_slugs.find(
          slug => slug.lang === lang
        )
        if (translatedSlug && translatedSlug.path) {
          return `/${translatedSlug.path}`
        }
        return slug
      })
    }

    return {
      alias,
      name,
      slug,
      path,
      component,
      story
    }
  })

  const filteredRoutes = routes.filter(Boolean)
  const nomalizedDir = addTrailingSlash(options.contentTypeDir)

  let dynamicRoutes = []

  filteredRoutes.forEach((route) => {
    if (options.generateDefaultPaths) {
      dynamicRoutes.push({
        route: `${route.slug}${options.trailingSlash ? '/' : ''}`,
        payload: null
      })
    }

    languageCodes.forEach((lang, index) => {
      dynamicRoutes.push({
        route: `/${lang}${route.alias[index] || ''}${options.trailingSlash ? '/' : ''}`,
        payload: null
      })
    })
  })

  dynamicRoutes = uniqBy(dynamicRoutes, 'route')

  this.extendRoutes((routes) => {
    filteredRoutes.forEach((route) => {
      const component = `${nomalizedDir}${route.component}`
      routes.push({
        name: route.name,
        path: `${route.path}${options.forceTrailingSlash ? '//' : ''}`,
        alias: route.alias,
        chunkName: component,
        component
      })
    })

    if (options.useFallback) {
      routes.push({
        name: 'Fallback',
        path: '*',
        component: `${nomalizedDir}fallback.vue`
      })
    }
  })

  this.options.router.trailingSlash = options.trailingSlash

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
      trailingSlash: options.trailingSlash,
      routes: dynamicRoutes.map(route => route.route)
    }
    this.requireModule(['@nuxtjs/sitemap', sitemapOptions])
  }

  // Disable parsing `pages/`
  this.nuxt.hook('build:before', () => {
    this.nuxt.options.build.createRoutes = () => {
      return []
    }
  })
}

module.exports.meta = require('../package.json')
