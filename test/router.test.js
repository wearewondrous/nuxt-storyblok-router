jest.setTimeout(60000)

const { Nuxt, Builder } = require('nuxt-edge')
const request = require('request-promise-native')
const getPort = require('get-port')

const config = require('../example/nuxt.config')
config.dev = false

let nuxt, port

const url = path => `http://localhost:${port}${path}`
const get = path => request(url(path))
const buildNuxt = async (config) => {
  nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()
  port = await getPort()
  await nuxt.listen(port)
}

describe('Storyblok Router', () => {
  beforeAll(async () => {
    await buildNuxt(config)
  })

  afterAll(async () => {
    await nuxt.close()
  })

  test('Render /', async () => {
    const html = await get('/')
    expect(html).toContain('Hello server')
  })

  test('Render / in different languages', async () => {
    const htmlFr = await get('/fr')
    expect(htmlFr).toContain('Hello French Server')

    const htmlDe = await get('/de')
    expect(htmlDe).toContain('Hello German Server')
  })

  test('Render /about', async () => {
    const html = await get('/about')
    expect(html).toContain('About')
  })

  test('Render /about in different languages', async () => {
    const htmlFr = await get('/fr/about')
    expect(htmlFr).toContain('About')
    expect(htmlFr).toContain('French')

    const htmlDe = await get('/de/about')
    expect(htmlDe).toContain('About')
    expect(htmlDe).toContain('German')
  })

  test('Display 404 when no route is found', async () => {
    try {
      await get('/404')
    } catch ({ statusCode, message }) {
      expect(statusCode).toBe(404)
      expect(message).toContain('Page not found')
    }
  })
})

describe('Storyblok Router with Options', () => {
  afterEach(async () => {
    await nuxt.close()
  })

  test('exclude Settings', async () => {
    await buildNuxt(config)

    const html = await get('/settings')
    expect(html).toContain('Settings')
    await nuxt.close()

    config.storyblokRouter.exclude = ['settings']
    await buildNuxt(config)

    try {
      await get('/settings')
    } catch ({ statusCode, message }) {
      expect(statusCode).toBe(404)
      expect(message).toContain('Page not found')
    }
  })

  test('generate Sitemap', async () => {
    config.storyblokRouter.sitemap = true
    await buildNuxt(config)

    const sitemap = await get('/sitemap.xml')
    expect(sitemap).toContain(`http://localhost:${port}/`)
    expect(sitemap).toContain(`http://localhost:${port}/about`)
    expect(sitemap).toContain(`http://localhost:${port}/fr`)
    expect(sitemap).toContain(`http://localhost:${port}/fr/about`)
  })

  test('generate Sitemap', async () => {
    config.storyblokRouter.disabled = true
    await buildNuxt(config)

    try {
      await get('/')
    } catch ({ statusCode, message }) {
      expect(statusCode).toBe(404)
    }
  })
})
