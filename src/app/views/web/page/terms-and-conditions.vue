<template>
    <section class="container">
        <breadcrumb :pages="breadcrumbsData"/>
        <div class="small-container">
            <header>
                <div class="user-avatar">
                    <img src="@/assets/images/icons-page.svg" alt="LV">
                </div>
                <h1>Terms & Conditions</h1>
            </header>
            <div class="desc">
                <p>
                    Thank you for visiting the laravel-vuejs™ website located at laravel-vuejs.space (the “Site”). The
                    Site is an
                    Internet property of laravel-vuejs Inc. (“laravel-vuejs™,” “we,” “our” or “us”). Each end-user
                    visitor to the Site
                    (“User”) agrees to the following laravel-vuejs™ Website Terms and Conditions (“Terms and
                    Conditions”), in
                    their entirety, when she/he: (a) accesses or uses the Site; (b) accesses and/or views any of the
                    video,
                    audio, stories, text, photographs, graphics, artwork and/or other content featured on the Site as
                    made
                    available by other Users (collectively, “User Submitted Content”) and/or laravel-vuejs™ (“LT
                    Content,” and
                    together with the User Submitted Content, “Content”); (c) accesses links to laravel-vuejs’™ social
                    media
                    pages/accounts on third party social media websites, such as Facebook® (collectively, “Social Media
                    Pages”); and/or (d) utilizes the Site’s many interactive features designed to facilitate interaction
                    between you, laravel-vuejs™ and other Users including, but not limited to, comment sections located
                    in
                    designated areas of the Site (collectively, the “Interactive Services” and together with the Site,
                    Content, and Social Media Pages, the “laravel-vuejs™ Offerings”).
                </p>
                <p>
                    The following Terms and Conditions are inclusive of the
                    laravel-vuejs™ Website Privacy Policy (“Privacy Policy”), and any and
                    all other applicable laravel-vuejs™ operating rules, policies, price schedules and other supplemental terms
                    and conditions or documents that may be published from time to time, which are expressly incorporated
                    herein by reference (collectively, the “Agreement”). By using and/or accessing the laravel-vuejs™ Offerings,
                    Users agree to comply with and be bound by the Agreement in its entirety. PLEASE REVIEW THE TERMS OF THE
                    AGREEMENT CAREFULLY. IF A USER DOES NOT AGREE TO THE AGREEMENT IN ITS ENTIRETY, THAT USER IS NOT
                    AUTHORIZED TO USE THE laravel-vuejs™ OFFERINGS IN ANY MANNER OR FORM.
                </p>
                <p>
                    Facebook® is a registered trademark of Facebook, Inc. (“Facebook”). Please be advised that laravel-vuejs™ is
                    not in any way affiliated with Facebook, and the laravel-vuejs™ Offerings are not endorsed, administered or
                    sponsored by Facebook.
                </p>
            </div>
        </div>
    </section>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
export default {
        name: "terms-and-conditions",
        components: {
            Breadcrumb: __Breadcrumb
        },
        data() {
            return {
                opened: true,
                breadcrumbsData: [{
                    name: 'Home',
                    link: "/"
                },
                    {
                        name: 'Pages'
                    },
                    {
                        name: 'Terms & Conditions'
                    }
                ]
            }
        },
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

    .desc
        p
            color #616d82
            font-size 18px
            line-height 28px
            margin-bottom 20px
</style>
