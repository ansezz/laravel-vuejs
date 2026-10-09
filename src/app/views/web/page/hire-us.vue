<template>
  <section class="news-letter-container">
    <breadcrumb :pages="breadcrumbsData" />
    <app-hire-us />
    <div class="container">
        <app-featured />
    </div>
  </section>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __AppHireUs from '@/components/web/partials/app-hire-us'
import __AppFeatured from '@/components/web/partials/app-featured'
export default {
        name: "NewsLetter",
        components: {
            Breadcrumb: __Breadcrumb,
            AppHireUs: __AppHireUs,
            AppFeatured: __AppFeatured,
        },
        data() {
            return {
                breadcrumbsData : [
                    { name: 'Home', link: "/" },
                    { name: 'newseletter', link: "/page/hire-us" }
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
