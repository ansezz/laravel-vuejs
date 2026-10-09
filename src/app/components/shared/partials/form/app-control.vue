<template>
  <div class="form-item" :class="{ 'is-wide' : wide, 'is-light' : light, 'has-icon' : icon }">

    <input v-if="type !=='textarea'" :type="type" :name="id" class="form-control" :id="id" :placeholder="placeholder">

    <textarea v-else :name="id" class="form-control" :id="id" :placeholder="placeholder"/>

    <label v-if="placeholder" class="form-control:label" :for="id">{{ placeholder }}</label>

    <label v-if="icon" class="form-control:icon" :for="id">
      <i :class="icon"/>
    </label>

  </div>
</template>

<script>
export default {
  name: "AppControl",
  props: {
    type: {
      type: String,
      default: "text"
    },
    icon: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null,
      required: true
    },
    placeholder: {
      type: String,
      default: null
    },
    wide: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="stylus" scoped>
  .form-item
    position relative

    &.is-wide
      grid-column span 2

    &.is-light
      .form-control
        background-color $white

    &.has-icon
      .form-control
        padding-left 50px

      .form-control\\:label
        left 50px

  .form-control
  .form-control\\:label
    color $secondary
    font-size 12px

  .form-control
    padding 10px 20px 0
    width 100%
    background-color rgba($secondary, .03)
    font-weight 600
    line-height 15px

    input&
      height 40px

    textarea&
      padding-top 20px
      height 70px

    &::placeholder
      color rgba(#fff, 0)

  .form-control\\:label
    position absolute
    top 0
    left 20px
    height 40px
    text-transform uppercase
    letter-spacing 2px
    font-weight 700
    line-height 40px
    opacity .7
    transition .25s transform, .25s opacity
    transform translate3d(0, 0, 0) scale(1)
    transform-origin left center
    pointer-events none
    user-select none

  .form-control:focus
  .form-control:not(:placeholder-shown)
    & ~ .form-control\\:label
      opacity 1
      transform translate3d(0, -25%, 0) scale(.65)

    & ~ .form-control\\:icon
      transform translate3d(-3px, 0, 0)

  .form-control\\:icon
    position absolute
    top 0
    left 20px
    display flex
    align-items center
    height 40px
    color $secondary
    font-size 20px
    transition .25s transform
    pointer-events none
    user-select none
</style>
