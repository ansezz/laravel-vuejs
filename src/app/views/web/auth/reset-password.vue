<!--laravelvuejs_Home_M.png-->
<template>
  <section class="reset-password">
    <app-reset-password />
  </section>
</template>

<script>
import __AppResetPassword from '@/components/web/partials/app-reset-password'
export default {
    components: {
        AppResetPassword: __AppResetPassword,
    },
    name: "ResetPassword"
  }
</script>

<style lang="stylus" scoped>
    .reset-password
        padding 65px 0 120px
</style>
