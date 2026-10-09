<template>
    <section class="is-relative">
        <div class="sign-up-form" v-if="register" id="register">
            <h3>Sign Up Now!</h3>
            <form @submit.prevent="submitSignup" :class="{'is-loading' : loading}">
                <div class="form-group">
                    <input type="text" class="form-control has-custom"
                           name="name"
                           placeholder="Name"
                           v-model="form.name"
                           required
                           v-validate="'required'"
                    >
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
                           required
                           v-validate="'required|email'">
                    <no-ssr>
                        <small class="text-danger" v-if="errors">{{ errors.first('email') }}</small>
                    </no-ssr>
                </div>
                <div class="form-group">
                    <input type="password"
                           class="form-control has-custom"
                           placeholder="Password"
                           v-model="form.password"
                           name="password"
                           required
                           v-validate="'required|min:6'"
                           autocomplete="password"
                    >
                    <no-ssr>
                        <small class="text-danger" v-if="errors">{{ errors.first('password') }}</small>
                    </no-ssr>
                </div>
                <ul class="form-status">
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
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
                    <button type="submit" class="button" name="start">Register</button>
                    <a @click="register=false" class="button no-background" href="#login">I have an account</a>
                </div>
            </form>
        </div>

        <div class="sign-up-form" v-if="!register" id="login" @submit.prevent="submitLogin"
             :class="{'is-loading' : loading}">
            <h3>Login Now!</h3>
            <form>
                <div class="form-group">
                    <input type="email" class="form-control has-custom"
                           name="email"
                           placeholder="E-mail or user name"
                           v-model="form.email"
                           required
                    >
                </div>
                <div class="form-group">
                    <input type="password" name="password" class="form-control has-custom" autocomplete="password"
                           placeholder="Password" v-model="form.password" required
                    >
                </div>
                <ul class="form-status">
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <div class="checking">
                    <input type="checkbox" id="lchecked" class="check" v-model="form.remember_me">
                    <label for="lchecked">Remember me next time</label>
                </div>
                <div class="alert" :class="'alert-'+message.type" role="alert" v-if="message.show">
                    {{message.content}}
                </div>
                <div class="form-actions">
                    <button type="submit" class="button" name="start">Login</button>
                    <a class="button no-background" @click="register=true" href="#register">Register</a>
                </div>
            </form>
        </div>
        <div class="loader-container" v-if="loading">
            <div class="loader-form"></div>
        </div>
    </section>
</template>

<script>
    import {mapActions} from 'vuex'

    export default {
        name: 'AppSignUpForm',
        computed: {
            errors() {
                return null
            }
        },
        data() {
            return {
                message: {
                    show: false,
                    content: '',
                    type: ''
                },
                register: true,
                validation: null,
                loading: false,
                done: false,
                form: {
                    name: '',
                    email: '',
                    password: '',
                    newsletter: true
                }
            }
        },
        methods: {
            ...mapActions({
                signup: 'auth/SIGNUP',
                login: 'auth/LOGIN',
            }),
            submitLogin() {
                this.loading = true;
                this.message.show = false;
                this.login(this.form).then((data) => {
                    if (!data) {
                        this.message.content = "Email or Password incorrect";
                        this.message.type = 'danger'
                        this.message.show = true
                    } else {
                        this.$toast.success('Successfully logged in')
                    }
                }).finally(() => {
                    this.loading = false;
                })
            },
            submitSignup() {
                this.loading = true;
                this.signup(this.form).then(() => {
                    this.done = true;
                }).catch((error) => {
                    this.validation = this.$utils.getGqlValidationErrors(error)
                }).finally(() => {
                    this.loading = false;
                })
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .sign-up-form
        width 400px
        background-color #FFF
        padding 50px

        h3
            font-size 16px
            font-weight 500
            color #384457
            margin-bottom 20px

        form
            .form-group
                margin-bottom 10px

            .form-actions
                display flex
                align-items center
                justify-content space-between

                button
                    width 130px

                .no-background
                    color $secondary
</style>
