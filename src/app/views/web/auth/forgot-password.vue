<template>
    <section class="forgot-password">
        <app-forgot-password />
    </section>
</template>

<script>
import __AppForgotPassword from '@/components/web/partials/app-forgot-password'
export default {
    name: "ForgotPassword",
    components: {
        AppForgotPassword: __AppForgotPassword,
    },
    props: {}
}
</script>

<style lang="stylus" scoped>
    .forgot-password
        padding 65px 0 120px
</style>
