<template>
    <div class="search-container" :class="{ 'open-search' : search.visibility }">
        <div class="container">
            <form class="search-form" @submit.prevent="">
                <div class="form-group">
                    <input type="text" name="s" class="form-control" placeholder="Search" v-model="searchText">
                    <i class="fa" :class="loading ? 'fa-spin fa-spinner' : 'fa-search' "/>
                </div>
                <ul class="search-result" v-if="posts.data && posts.data.length  > 0 ">
                    <li class="is-relative" v-for="(item , key) in posts.data" :key="key">
                        <div class="search-thumb">
                            <img :src="item.image_url" :alt="item.title"/>
                        </div>
                        <div class="search-info">
                            <h3>{{item.title}}</h3>
                            <span> <i class="fa fa-clock-o"></i> {{item.time_ago}} </span>
                        </div>
                        <nuxt-link aria-label="Link LV" :to="{ name: 'slug', params: { slug: item.slug }}" class="is-absolute"/>
                    </li>
                </ul>
                <ul class="search-result" v-if="posts.data && posts.data.length === 0">
                    <li>
                        <div class="search-info">
                            <h3>Sorry :( No posts found, please try another keyword ...</h3>
                        </div>
                    </li>
                </ul>
                <nuxt-link aria-label="Link LV" :to="{name : 'posts', query : {s :searchText }}" class="button"
                           v-if="posts.data && posts.data.length > 0">
                    Show all result
                </nuxt-link>
            </form>
            <div @click.prevent="toggleSearchVisibility" class="close-search"
                 v-if="posts.data && posts.data.length > 0">
                <img src="@/assets/images/close-button.png" alt="LV">
            </div>
        </div>
    </div>
</template>

<script>
    import {mapActions} from 'vuex';
    import { queryPosts } from '@/lib/posts-api.js'

    // The Apollo smart query (posts, skipped below 3 characters) is replaced by a
    // client-side search over the static /api/posts.json index.
    export default {
        name: 'AppSearch',
        data() {
            return {
                posts: {},
                searchText: '',
                count: 12,
                searching: false,
                loading: false
            }
        },
        watch: {
            searchText(value) {
                if (value.length < 3) return
                this.loading = true
                queryPosts({count: this.count, s: value}).then((result) => {
                    if (value === this.searchText) this.posts = result
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        computed: {
            search() {
                return this.$store.state.search
            },
        },
        methods: {
            ...mapActions(['toggleSearchVisibility']),
        },
    }

</script>

<style lang="stylus" scoped>
    .search-container
        position fixed
        top 0
        left 0
        width 100%
        height 100%
        background-color rgba(0, 0, 0, .9)
        z-index 100
        display none
        align-items center
        justify-content center

        &.open-search
            display flex

        .form-group
            margin-bottom 0
            position relative

            .form-control
                height 80px
                border 0
                border-radius 0
                font-size 25px
                font-weight 600
                background-color #3e383e
                padding-left 20px
                box-shadow none
                color #969393

                &::placeholder
                    color #969393

            .fa
                position absolute
                top 0
                right 0
                width 100px
                height 100%
                display flex
                align-items center
                justify-content center
                font-size 25px
                color #969393

        .close-search
            position absolute
            top 20px
            right 20px
            cursor pointer

            img
                width 25px
                height 25px

        .button
            width 100%

        .search-result
            background-color #3e383e
            height 400px
            overflow-y scroll

            li
                display flex
                align-items center
                padding 20px 20px 0

                &:last-child
                    padding-bottom 20px

                &:hover
                    .search-info
                        h3
                            color $primary

            .search-thumb
                width 110px
                margin-right 20px

                img
                    width 100%

            h3
                font-size 18px
                color #FFF
                font-weight 600
                margin-bottom 10px
                transition all .35s ease-in-out

            span
                color #b3a7a7

</style>
