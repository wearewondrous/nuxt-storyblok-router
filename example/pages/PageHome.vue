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
  async asyncData({ app, route }) {
    const lang = get(route, 'params.lang', 'en')
    const query = `cdn/stories/${lang === 'en' ? '' : lang + '/'}home`
    const { data } = await app.$storyapi.get(query)

    return data
  }
}
</script>
