<template>
  <div class="container has-width:fluid"
      :class="{
          'is-fluid' : fluid,
          'is-small' : small,
        }">
    <slot/>
  </div>
</template>

<script>
export default {
  name: "Container",
  props: {
    fluid: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="stylus" scoped>
  @css {
    @lost flexbox flex;
  }
  .container
    lost-center 1070px 15px

    &.is-fluid
      lost-center 100% 15px

    &.is-small
      lost-center 830px 15px
</style>
