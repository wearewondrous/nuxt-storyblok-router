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
  async asyncData({ app }) {
    const { data } = await app.$storyapi.get("cdn/stories/home")

    return data
  }
}
</script>