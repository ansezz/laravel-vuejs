<template>
  <main class="main">
    <slot/>
  </main>
</template>

<script>
export default {
  name: "AppMain"
}
</script>

<style lang="stylus" scoped>
  .main
    flex 1
</style>
