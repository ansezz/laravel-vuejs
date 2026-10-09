<template>
    <section class="create-job-container">
        <breadcrumb :pages="breadcrumbsData" />
        <app-create-job />
    </section>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __AppCreateJob from '@/components/web/partials/app-create-job'
export default {
        name: "CreateJob",
        components: {
            Breadcrumb: __Breadcrumb,
            AppCreateJob: __AppCreateJob
        },
        data() {
            return {
                breadcrumbsData: [{
                        name: 'Home',
                        link: "/"
                    },
                    {
                        name: 'Create Job',
                        link: "/page/create-job"
                    }
                ]
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .create-job-container
        padding-bottom 120px
</style>
