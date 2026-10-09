<template>
  <div v-if="!loggedIn" class="widget">
    <heading>Subsribe</heading>
    <app-form class="subscribe-widget">
      <template v-slot:desc>
        <p>Sign up for our newsletter, and we'll send you news and tutorials on web design, coding, business, and
          more!</p>
      </template>
      <div class="alert alert-success" role="alert" v-if="message">
        {{message}}
      </div>
      <div class="form-group">
        <input type="email" class="form-control" placeholder="E-mail" v-model="email">
        <div class="img">
          <i class="fa fa-envelope"></i>
        </div>
      </div>
      <template v-slot:actions>
        <button class="button" type="submit" @click.prevent="subscribe">Subscribe</button>
      </template>
    </app-form>
  </div>
</template>

<script>
  import subscribeQql from '@/graphql/mutations/subscribe.graphql';

  export default {
    name: 'AppSubscribeForm',
    data() {
      return {
        email: null,
        message: null
      }
    },
    computed :{
      loggedIn() {
        return this.$store.state.auth.loggedIn;
      }
    },
    methods: {
      subscribe() {
        if (!this.email)
          return;

        let variables = {email: this.email};
        this.message = null;
        this.$apollo.mutate({mutation: subscribeQql, variables})
          .then((data) => {
            this.message = data.data.subscribe
          })
      }
    },
  }
</script>

<style lang="stylus" scoped>
  .heading
    margin-bottom 30px

  .widget
    margin-bottom 63px

    &.last-widget
      margin-bottom 0

  .subscribe-widget
    p
      font-size 14px
      font-weight 400
      color $tertiary
      margin-bottom 20px
      opacity .8

    .form-control
      background-color rgba($secondary, .03)
</style>
