<template>
  <div class="column"
      :class="{
          'is-large' : large,
          'is-small' : small,
          'is-half' : half,
        }">
    <slot/>
  </div>
</template>

<script>
export default {
  name: "Column",
  props: {
    large: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
    half: { type: Boolean, default: false }
  }
}
</script>

<style lang="stylus" scoped>
  .column
    flex 0 0 auto
    flex-wrap wrap
    width 100%

    &:nth-child(2n+1)
      margin-right 20px

    &.is-large
      flex 1 0 auto
      width calc(100% - 300px - 20px)

    &.is-small
      flex 0 0 300px
      width 300px

    &.is-half
      flex 0 0 auto
      width calc(50% - 10px)
</style>
