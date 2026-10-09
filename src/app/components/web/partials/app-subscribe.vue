<template>
  <section class="subscribe" v-if="!loggedIn">
    <div class="container">
      <div class="row">
        <div class="col-sm-6">
          <div class="subscribe-info">
            <h3>Stay in Touch</h3>
            <p>Sign up for our newsletter, and we'll send you news and tutorials, coding, business, and more!</p>
          </div>
        </div>
        <div class="col-sm-6">
          <app-form class="subscribe-form" :submit="subscribe">
            <div class="alert alert-success text-center" role="alert" v-if="message">
              <i class="glyphicon glyphicon-check"></i>
              <b>{{message}}</b>
            </div>
            <div class="form-group">
              <input type="email" class="form-control" placeholder="E-mail" v-model="email" required aria-label="email" autocomplete="true">
              <div class="img">
                <i class="fa fa-envelope"></i>
              </div>
            </div>
            <template v-slot:actions>
              <button class="button" type="submit" :disabled="loading">Subscribe</button>
              <!--<button class="button no-background" type="submit">Advenced subscribe</button>-->
            </template>
          </app-form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import subscribeQql from '@/graphql/mutations/subscribe.graphql';

  export default {
    name: "AppSubscribe",

    props: {},
    computed: {
      loggedIn() {
        return this.$store.state.auth.loggedIn;
      }
    },
    data() {
      return {
        loading: false,
        email: '',
        message: null
      }
    },
    methods: {
      subscribe() {
        if (!this.email)
          return;

        let variables = {email: this.email};
        this.message = null;
        this.loading = true;
        this.$apollo.mutate({mutation: subscribeQql, variables})
          .then((data) => {
            this.message = data.data.subscribe
          }).finally(() => {
          this.loading = false
        })
      }
    },
    mounted() {
    }
  }
</script>

<style lang="stylus" scoped>
  .subscribe
    padding 50px 0
    background-color $secondary

    .subscribe-info
      color #FFF

      h3
        font-size 24px
        font-weight 400
        line-height 1.4
        margin-bottom 10px

      p
        margin-bottom 0
        font-size 16px
        font-weight 300
        opacity 0.8
</style>
