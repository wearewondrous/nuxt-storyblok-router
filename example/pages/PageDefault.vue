<template>
  <div>
    <h1>{{ story.content.title }}</h1>
    <p>
      {{ story.content.text }}
    </p>
  </div>
</template>

<script>
export default {
  async asyncData({ app, route }) {
    const { data } = await app.$storyapi.get(`cdn/stories${route.path}`)

    return data
  }
}
</script>