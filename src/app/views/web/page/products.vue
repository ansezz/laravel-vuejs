<template>
    <div class="products-container">
        <breadcrumb :pages="breadcrumbsData" />
        <div class="single-profile-header">
            <div class="container">
                <ul class="left-area">
                    <li>
                        <span>Products</span>
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
            <div class="content-wrapper">
                <div class="col-9">
                    <app-product />
                    <pagination />
                </div>
                <div class="col-3">
                    <app-subscribe-form />
                    <app-popular-posts />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import __Breadcrumb from '@/components/shared/partials/elements/breadcrumb'
import __Pagination from '@/components/shared/partials/elements/pagination'
import __AppSubscribeForm from '@/components/web/partials/app-subscribe-form'
import __AppPopularPosts from '@/components/web/partials/app-popular-posts'
import __AppProduct from '@/components/web/partials/app-product'
export default {
        name: "Products",
        components: {
            Breadcrumb: __Breadcrumb,
            Pagination: __Pagination,
            AppSubscribeForm: __AppSubscribeForm,
            AppPopularPosts: __AppPopularPosts,
            AppProduct: __AppProduct
        },
        data() {
            return {
                breadcrumbsData: [{
                        name: 'Home',
                        link: "/"
                    },
                    {
                        name: 'Products',
                        link: "/"
                    }
                ]
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .products-container
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
    .left-area
        float left
        display flex
        align-items center
        li
            display flex
            align-items center
            font-size 24px
            color #384457
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
