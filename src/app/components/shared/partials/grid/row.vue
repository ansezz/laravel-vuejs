<template>
  <div class="row has-width:fluid">
    <slot/>
  </div>
</template>

<script>
export default {
  name: "Row"
}
</script>

<style lang="stylus" scoped>
  @css {
    @lost flexbox flex;
  }
  .row
    lost-center 100% 0
</style>
