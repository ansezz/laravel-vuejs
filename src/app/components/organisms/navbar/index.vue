
<template>
  <nav class="navbar" :class="{ 'is-loading' : loading, 'is-mobile' : isMobile }">
    <div class="container">
      <div class="navbar-container">
        <ul class="navbar-list">
          <li>
            <a href="#" @click.prevent="toggleNavigationVisibility">
              <i class="fa fa-bars"></i>
              <span v-if="isWeb()">Menu</span>
            </a>
          </li>
          <li v-if="isWeb()">
            <a @click.prevent="toggleSearchVisibility" href="#">
              <i class="fa fa-search"></i>
              <span>Search</span>
            </a>
          </li>
        </ul>

        <nuxt-link aria-label="Link LV" class="navbar-brand" to="/">
          <Brand :loading="loading"/>
        </nuxt-link>

        <ul class="navbar-list">
          <li v-if="isWeb()">
            <nuxt-link aria-label="Link LV" to="/page/hire-us">
              <i class="fa fa-briefcase"></i>
              <span>Hire Us</span>
            </nuxt-link>
          </li>
          <li v-if="loggedIn && me">
            <nuxt-link aria-label="Link LV" to="/auth/account">
              <i class="fa fa-user"></i>
              <span v-if="isWeb()">{{me.name}}</span>
            </nuxt-link>
          </li>
          <li v-else>
            <nuxt-link aria-label="Link LV" to="/auth/signup">
              <i class="fa fa-user"></i>

              <span v-if="isWeb()">Sign up/in</span>
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>

    <app-search/>
  </nav>
</template>

<script>
import __AppSearch from '@/components/web/partials/app-search'
import __Brand from '@/components/shared/atoms/brand'
import { mapActions, mapMutations } from "vuex";

  export default {
    name: "Navbar",

    components: {
      AppSearch: __AppSearch,
      Brand: __Brand
    },

    watch: {
      $route: function() {
        this.setNavigationVisibility(false);
        this.setSearchVisibility(false);
      }
    },

    computed: {
      me() {
        return this.$store.state.auth.me;
      },
      loggedIn() {
        return this.$store.state.auth.loggedIn;
      },
      loading() {
        return false; // Nuxt progress bar state; there is no client-side routing on the static site
      }
    },

    methods: {
      ...mapMutations({
        setNavigationVisibility: "SET_NAVIGATION_VISIBILITY",
        setSearchVisibility: "SET_SEARCH_VISIBILITY"
      }),
      ...mapActions(["toggleNavigationVisibility", "toggleSearchVisibility"])
    }
  };
</script>

<style lang="stylus" scoped>
  .navbar
    position sticky
    top 0
    z-index 100
    margin-bottom 0
    border none
    border-radius 0
    background #fff

    &.is-loading .navbar-list
      opacity 0

  .navbar-brand
    display block
    padding 0
    width 100px + 25%
    height 24px + 25%

  .container
    padding 0

  .navbar-container
    display flex
    justify-content space-between
    align-items center
    padding 0 20px
    height 70px
    border-bottom 5px solid $primary

  .navbar-list
    display flex
    align-items center
    transition .25s opacity ease

    li
      padding-right 42px

      &:last-child
        padding-right 0

      a
        display flex
        align-items center
        color $secondary
        text-transform uppercase
        letter-spacing 1px
        font-weight 600
        font-size 12px

        .fa
          font-size 15px

        span
          margin-top 4px
          margin-left 10px
</style>
