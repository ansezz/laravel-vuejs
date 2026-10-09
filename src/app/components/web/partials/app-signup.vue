<template>
    <div class="signup-form">
        <header>
            <div class="user-avatar">
                <img src="@/assets/images/icons-user.png" alt="LV">
            </div>
            <h1>SignUp</h1>
            <p>Welcome</p>
        </header>
        <form @submit.prevent="submitSignup" :class="{'is-loading' : loading}">
            <h5 class="text-center">Create new account</h5>
            <div class="form-group">
                <input type="text"
                       class="form-control has-custom"
                       name="name"
                       placeholder="Name"
                       v-model="form.name"
                       v-validate="'required'"
                />
                <no-ssr>
                    <small class="text-danger" v-if="errors">{{ errors.first('name') }}</small>
                </no-ssr>
            </div>
            <div class="form-group">
                <input type="email"
                       class="form-control has-custom"
                       name="email"
                       placeholder="E-mail"
                       v-model="form.email"
                       v-validate="'required|email'"
                />
                <no-ssr>
                    <small class="text-danger" v-if="errors">{{ errors.first('email') }}</small>
                </no-ssr>
            </div>
            <div class="form-group m-20">
                <input type="password"
                       class="form-control has-custom"
                       placeholder="Password"
                       v-model="form.password"
                       name="password"
                       v-validate="'required|min:6'"
                />
                <no-ssr>
                    <small class="text-danger" v-if="errors">{{ errors.first('password') }}</small>
                </no-ssr>
            </div>
            <div class="checking">
                <input type="checkbox" id="checked" class="check" v-model="form.newsletter">
                <label for="checked">I want to hear from you about products and services.</label>
            </div>
            <div class="alert alert-danger" role="alert" v-if="validation">
                <ul>
                    <li v-for="(item,key) in validation" :key="key">{{item[0]}}</li>
                </ul>
            </div>
            <div class="form-actions">
                <button class="button" type="submit" name="go">go ahead</button>
                <nuxt-link aria-label="Link LV" to="/auth/login" class="button no-background">I have an account</nuxt-link>
            </div>
        </form>
        <footer class="text-center">
            <nuxt-link aria-label="Link LV" to="/auth/forgot-password" class="forgot-password">What? you forgot your password?</nuxt-link>
        </footer>
    </div>
</template>

<script>
    import {mapActions} from 'vuex'

    export default {
        name: "SignupApp",
        computed: {
            errors() {
                return null
            }
        },
        data() {
            return {
                validation: null,
                loading: false,
                form: {
                    name: '',
                    email: '',
                    password: ''
                }
            }
        },
        props: {},
        methods: {
            ...mapActions({
                signup: 'auth/SIGNUP',
            }),
            submitSignup() {
                this.loading = true;
                this.signup(this.form).catch((error) => {
                    this.validation = this.$utils.getGqlValidationErrors(error)
                }).finally(() => {
                    this.loading = false;
                })
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .signup-form
        width 580px
        margin auto

        header
            text-align center
            margin-bottom 40px

            h1
                font-size 28px
                font-weight 600
                color $tertiary
                margin 10px 0
                line-height 1.4

            p
                margin-bottom 0
                font-size 14px
                color #616d82
                opacity .8

        form
            border 2px solid #ebeef2
            padding 40px
            margin-bottom 60px

            h5
                font-size 18px
                color #616d82
                line-height 28px
                font-weight 400
                margin-bottom 40px

            .form-group
                margin-bottom 10px

                &.m-20
                    margin-bottom 20px

            .form-actions
                display flex
                align-items center
                justify-content space-between

                .no-background
                    color $secondary

        footer
            .forgot-password
                color $secondary
                font-size 12px
                font-weight 600
                text-transform uppercase
                letter-spacing 2px
</style>
