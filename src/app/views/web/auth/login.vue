<!--laravelvuejs_Home_M.png-->
<template>
    <section class="app-login">
        <app-login />
    </section>
</template>

<script>
import __AppLogin from '@/components/web/partials/app-login'
export default {
    components: {
        AppLogin: __AppLogin,
    },
    name: "Login"
  }
</script>

<style lang="stylus" scoped>
    .app-login
        padding 65px 0 120px
</style>
