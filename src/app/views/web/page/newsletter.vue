<template>
  <section class="news-letter-container">
    <breadcrumb :pages="breadcrumbsData" />
    <app-newsletter />
    <div class="container">
        <app-featured />
    </div>
  </section>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __AppNewsletter from '@/components/web/partials/app-newsletter'
import __AppFeatured from '@/components/web/partials/app-featured'
export default {
        name: "NewsLetter",
        components: {
            Breadcrumb: __Breadcrumb,
            AppNewsletter: __AppNewsletter,
            AppFeatured: __AppFeatured,
        },
        data() {
            return {
                breadcrumbsData : [
                    { name: 'Home', link: "/" },
                    { name: 'newseletter', link: "/page/newsletter" }
                ]
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .news-letter-container
        .featured-articles
            padding 0 0 120px
</style>
