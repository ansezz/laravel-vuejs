<template>
  <section class="container">
    <breadcrumb :pages="breadcrumbsData"/>
    <div class="small-container">
      <header>
        <div class="user-avatar">
          <img src="@/assets/images/icons-page.svg" alt="LV">
        </div>
        <h1>You profile WIP</h1>
      </header>
      <div class="">
        <p>You profile, Work in progress ..., will be soon available.</p>
        <button class="button button-green pull-right" @click="logout"> Logout</button>
      </div>
    </div>
  </section>
</template>

<script>
  import {mapActions} from 'vuex'

  export default {
    components: {},
    methods: {
      ...mapActions({
        logout: 'auth/LOGOUT',
      }),
    },
    name: "account"
  }
</script>

<style lang="stylus" scoped>
  .container
    padding-bottom 30px
  header
    text-align center
    margin 60px 0 30px
    h1
      font-size 28px
      font-weight 600
      color $tertiary
      margin 10px 0
      line-height 1.4
</style>
