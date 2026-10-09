<template>
    <div class="single-profile-container">
        <breadcrumb :pages="breadcrumbsData" />
        <div class="single-profile-header">
            <div class="container">
                <ul class="left-area">
                    <li>
                        <img src="@/assets/images/single-profile-icon.png" alt="LV">
                        <span>Beats Electrics</span>
                    </li>
                    <li>
                        <span>Morocco (+2)</span>
                        <img src="@/assets/images/icons-extern.svg" alt="LV">
                    </li>
                </ul>
                <div class="filters">
                    <div class="filter-group">
                        <select name="showen-posts">
                            <option value="1">show 16 posts</option>
                            <option value="1">show 16 posts</option>
                            <option value="1">show 16 posts</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <select name="most-popular">
                            <option value="2">Most popular first</option>
                            <option value="2">Most popular first</option>
                            <option value="2">Most popular first</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="actions">
                <form action="#" method="post">
                    <div class="search-input">
                        <input type="search" name="search" class="form-control has-custom" placeholder="*Keywords, Locations, Job titles..">
                        <img src="@/assets/images/icons-search.svg" alt="LV">
                    </div>
                    <div class="region-area">
                        <select name="region" class="form-control has-custom">
                            <option value="-1">Region</option>
                        </select>
                        <button class="button" type="submit">Search</button>
                    </div>
                </form>
            </div>
        </div>
        <section class="job-tabs">
            <div class="container">
                <ul class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active"><a href="#all" aria-controls="all" role="tab" data-toggle="tab">All jobs</a></li>
                    <li role="presentation"><a href="#full-time" aria-controls="full-time" role="tab" data-toggle="tab">Full-time</a></li>
                    <li role="presentation"><a href="#part-time" aria-controls="part-time" role="tab" data-toggle="tab">Part-time</a></li>
                    <li role="presentation"><a href="#freelance" aria-controls="freelance" role="tab" data-toggle="tab">Freelance</a></li>
                    <li role="presentation"><a href="#temporary" aria-controls="temporary" role="tab" data-toggle="tab">Temporary</a></li>
                    <li role="presentation"><a href="#intership" aria-controls="intership" role="tab" data-toggle="tab">Intership</a></li>
                    <li role="presentation"><a href="#remote" aria-controls="remote" role="tab" data-toggle="tab">Remote</a></li>
                </ul>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane active" id="all">
                        <div class="content-wrapper">
                            <div class="col-9">
                                <app-jobs />
                                <pagination/>  
                            </div>
                            <div class="col-3">
                                <app-latest-profiles />
                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="full-time">
                        <div class="content-wrapper">
                            <div class="col-9">
                                <app-jobs />
                                <pagination/>  
                            </div>
                            <div class="col-3">
                                <app-latest-profiles />
                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="part-time">
                        <div class="content-wrapper">
                            <div class="col-9">
                                <app-jobs />
                                <pagination/>  
                            </div>
                            <div class="col-3">
                                <app-latest-profiles />
                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="freelance">
                        <div class="content-wrapper">
                            <div class="col-9">
                                <app-jobs />
                                <pagination/>  
                            </div>
                            <div class="col-3">
                                <app-latest-profiles />
                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="temporary">
                        <div class="content-wrapper">
                            <div class="col-9">
                                <app-jobs />
                                <pagination/>  
                            </div>
                            <div class="col-3">
                                <app-latest-profiles />
                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="intership">
                        <div class="content-wrapper">
                            <div class="col-9">
                                <app-jobs />
                                <pagination/>  
                            </div>
                            <div class="col-3">
                                <app-latest-profiles />
                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="remote">
                        <div class="content-wrapper">
                            <div class="col-9">
                                <app-jobs />
                                <pagination/>  
                            </div>
                            <div class="col-3">
                                <app-latest-profiles />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __Pagination from '@/components/shared/partials/elements/pagination'
import __AppLatestProfiles from '@/components/web/partials/app-latest-profiles'
import __AppJobs from '@/components/web/partials/app-jobs'
export default {
        name: "SigneProfile",
        components: {
            Breadcrumb: __Breadcrumb,
            Pagination: __Pagination,
            AppLatestProfiles: __AppLatestProfiles,
            AppJobs: __AppJobs
        },
        data() {
            return {
                breadcrumbsData: [{
                        name: 'Home',
                        link: "/"
                    },
                    {
                        name: 'Companies',
                        link: "/"
                    },
                    {
                        name: 'Beats Electronics',
                        link: "/"
                    }
                ]
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .single-profile-container
        padding-bottom 120px
    .content-wrapper
        display flex
        justify-content space-between
        padding-top 40px
        .col-9
            width 720px
        .col-3
            width calc(100% - 740px)
    .single-profile-header
        margin-top 40px
        margin-bottom 20px
        height 70px
        display flex
        align-items center
        background-image linear-gradient(to top, rgba(135, 147, 167, .1), rgba(135,147,167,0))
    .actions
        form
            display flex
            align-items center
            justify-content space-between
            .search-input
                width 670px
                margin-right 10px
                position relative
                img
                    position absolute
                    top 50%
                    right 20px
                    transform translateY(-50%)
            .region-area
                width calc(100% - 680px)
                display flex
                align-items center
                select
                    margin-right 10px
        .container
            overflow hidden
    .left-area
        float left
        display flex
        align-items center
        li
            display flex
            align-items center
            font-size 24px
            color #384457
            padding-right 10px
            img
                padding-right 10px
            &:last-child
                padding-right 0
                padding-top 5px
                span
                    font-size 14px
                    color #616d82
                    opacity .8
                img
                    padding-right 0
                    padding-left 5px
                    cursor pointer
    .job-tabs
        margin-top 20px
        position relative
        &:before
            content ""
            height 2px
            width 100%
            background-color #ebeef2
            display block
            position absolute
            top 38px
    .nav-tabs
        border-bottom 0
        li
            margin-bottom -2px
            background-color #FFF
            a
                font-size 14px
                font-weight 600
                color #384457
                margin-right 0
                border-radius 0
                line-height 1
                border 0
                padding 12px 45px
                &:hover,
                &:focus
                    background-color transparent
            &.active
                a
                    color $secondary
                    border 2px solid #ebeef2
                    border-bottom 0
            
    .filters
        float right
        display flex
        align-items center
        height 34px

    .filter-group
        position relative
        margin-right 45px

        &:after
            content "\f0d7"
            font-family "FontAwesome"
            color $secondary
            padding-left 15px

        &:last-child
            margin-right 0

        select
            font-size 12px
            font-weight 600
            letter-spacing 2px
            color $secondary
            text-transform uppercase
            border 0
            background-color transparent
            outline none
            -webkit-appearance none
            -moz-appearance none
            appearance none    
</style>
