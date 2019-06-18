import StoryblokClient from 'storyblok-js-client'

export default function ({ env }, inject) {
  const client = new StoryblokClient({
    accessToken: env.accessToken
  })

  inject('storyapi', client)
}
