<template>
    <nuxt-link aria-label="Link LV" :to="to" class="article-image">
      <img v-lazy="src" :alt="alt">
      <span class="post-loader">
        <Loader/>
      </span>
      <span class="post-error"></span>
    </nuxt-link>
</template>

<script>
import __Loader from './loader'
export default {
    name: "Thumbnail",
    components: {
      Loader: __Loader
    },
    props: {
      to: [String, Object],
      paramValue: {
        type: String,
        default: null
      },
      src: {
        type: String,
        default: null
      },
      alt: {
        type: String,
        default: null
      }
    }
  };
</script>

<style lang="stylus" scoped>
  .post-loader
    position absolute
    top 50%
    left 50%
    transform translate3d(-50%, -50%, 0) scale(.5)

  .post-error
    position absolute
    color #FFF
    font-size 14px
    opacity 0
    transition opacity .25s ease-in-out

    &:before
      display block
      margin auto
      width 40px
      height 40px
      background-image url('../../../../assets/images/broken-pic.png')
      background-size contain
      content ''

  .article-image
    position relative
    display flex
    justify-content center
    align-items center
    overflow hidden
    padding 0
    width 100%
    background-color rgba($tertiary, .05)
    background-size 50%

    &::before
      display block
      padding-top 54%
      content ''

    img
      position absolute
      top 0
      bottom 0
      left 0
      width 100%
      height 100%
      opacity 0
      transition opacity .25s ease-in-out, transform .5s ease-in-out
      object-fit cover

      &[lazy=error]
        opacity 0

        ~.post-loader
          opacity 0

        ~.post-error
          opacity 1

      &[lazy=loading]
        opacity 0

        ~.post-loader
          opacity 1

      &[lazy=loaded]
        opacity 1

        ~.post-loader
          opacity 0

    &.small
      img
        &[lazy=error]
          ~.post-error
            font-size 10px

            &:before
              width 25px
              height 25px
</style>
