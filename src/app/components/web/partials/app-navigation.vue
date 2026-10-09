<template>
  <div class="navigation" :class="{ 'is-visible' : navigation.visibility }">
    <div class="navigation-overlay" @click="toggleNavigationVisibility"/>
    <nav class="navigation-list">
      <div class="navigation-header">
        <a @click.prevent="toggleNavigationVisibility" href="#" class="close-menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path
              fill="#6936D3"
              fill-rule="evenodd"
              d="M16 5.209L14.791 4 10 8.791 5.209 4 4 5.209 8.791 10 4 14.791 5.209 16 10 11.209 14.791 16 16 14.791 11.209 10z"
            ></path>
          </svg>
          <span>Menu</span>
        </a>
      </div>
      <div class="navigation-body">
        <ul class="items">
          <li class="item-heading">
            <span>Blog</span>
          </li>
          <li v-for="(item ,key) in main_menu" :key="key">
            <nuxt-link aria-label="Link LV" :to="item.url">{{item.name}}</nuxt-link>
          </li>
        </ul>
        <ul class="items last-items">
          <li v-for="(item ,key) in second_menu" :key="key">
            <nuxt-link aria-label="Link LV" :to="item.url">{{item.name}}</nuxt-link>
          </li>
        </ul>
        <ul class="social-media">
          <li v-for="(item, index) in social_media" :key="index" :class="item.class">
            <a :href="item.href"  target="_blank" rel="noreferrer"   aria-label="external link "   >
              <i class="fa" :class="'fa-'+item.class"/>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
  import { mapActions } from "vuex";

  export default {
    name: "AppNavigation",
    computed: {
      navigation() {
        return this.$store.state.navigation;
      },
      main_menu() {
        return this.$store.state.main_menu;
      },
      second_menu() {
        return this.$store.state.second_menu;
      },
      social_media() {
        return this.$store.state.social_media;
      }
    },
    methods: {
      ...mapActions(["toggleNavigationVisibility"])
    }
  };
</script>

<style lang="stylus" scoped>
  .navigation.is-visible
    .navigation-overlay
      visibility visible
      opacity 1

    .navigation-list
      transform translate3d(0, 0, 0)

  .navigation-overlay
    position fixed
    top 0
    left 0
    z-index 110
    visibility hidden
    width 100%
    height 100%
    background-color rgba($tertiary, .5)
    opacity 0
    cursor pointer
    transition all .35s

  .navigation-list
    position fixed
    top 0
    left 0
    z-index 111
    display flex
    flex-direction column
    width 300px
    height 100%
    background-color #FFF
    transition transform .35s ease
    transform translate3d(-100%, 0, 0)

    .navigation-header
      padding 25px

      .close-menu
        display flex
        justify-content flex-end
        align-items center
        color $secondary
        text-transform uppercase
        letter-spacing 1px
        font-weight 600
        font-size 12px

        svg
          margin-right 12px

    .navigation-body
      flex 1
      overflow-y scroll

      &::-webkit-scrollbar
        width 5px

      &::-webkit-scrollbar-thumb
        background-color $secondary

      .items
        position relative
        margin-bottom 50px
        padding 0 40px 0 82px

        &.has-separated
          padding-bottom 50px
          border-bottom 1px solid #ebeef2

        &.last-items
          padding-left 32px

        li
          a
            color #616d82
            font-size 16px
            line-height 30px

          &.item-heading
            position absolute
            top 10px
            left 20px
            display flex
            align-items center
            color $secondary
            font-weight 700
            transform rotate(90deg)

            span
              display block
              font-size 16px

          &.active
            a
              color $secondary

      .social-media
        display flex
        flex-wrap wrap
        align-items center
        padding 0 32px 30px

        li
          margin-bottom 5px
          width calc((100% / 5))
          text-align center

          &:last-child
            padding-right 0

          a
            display block
            color #311d5a
            font-size 17px
</style>
