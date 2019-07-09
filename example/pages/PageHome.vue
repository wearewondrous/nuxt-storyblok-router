<template>
  <div>
    <h1>{{ story.content.title }}</h1>
    <p>
      {{ story.content.text }}
    </p>
  </div>
</template>

<script>
import get from 'lodash/get'

export default {
  async asyncData({ app, route, error }) {
    const lang = get(route, 'params.lang', 'en')
    const query = `cdn/stories/${lang === 'en' ? '' : lang + '/'}home`

    try {
      const { data } = await app.$storyapi.get(query)

      return data
    } catch (e) {
      error({
        statusCode: 404,
        message: 'Page not found'
      })
    }
  }
}
</script>
