<template>
    <section>
        <app-about-area />
        <div class="small-container">
            <app-facts />
        </div>
        <div class="team-container" v-if="false">
            <div class="small-container">
                <app-team />
            </div>
        </div>
        <div class="join-us-container">
            <div class="small-container">
                <app-join-us />
            </div>
        </div>
    </section>
</template>

<script>
import __AppAboutArea from '@/components/web/partials/app-about-area'
import __AppFacts from '@/components/web/partials/app-facts'
import __AppTeam from '@/components/web/partials/app-team'
import __AppJoinUs from '@/components/web/partials/app-join-us'
export default {
        components: {
            AppAboutArea: __AppAboutArea,
            AppFacts: __AppFacts,
            AppTeam: __AppTeam,
            AppJoinUs: __AppJoinUs
        },
        name: "About"
    }

</script>

<style lang="stylus" scoped>
    .team-container
        border-top 1px solid #ebeef2
        padding 120px 0
    .join-us-container
        background-color $primary
        padding 63px 0
</style>
