<template>
    <div class="filters">
        <div class="filter-group is-flex">
            <div class="is-relative">
                <input type="text"
                       v-model="filter.s"
                       name="search"
                       placeholder="Search ... "
                       aria-label="Search"
                       @keyup.enter="filterChange"
                       class="form-control has-custom"
                >
                <i class="fa fa-search" @click="filterChange"></i>
            </div>
            <select name="showen-posts" aria-label="count" @change="filterChange" v-model="filter.count">
                <option value="12">show 12 posts</option>
                <option value="24">show 24 posts</option>
                <option value="48">show 48 posts</option>
            </select>
        </div>
        <div class="filter-group is-flex">
            <select name="most-popular" aria-label="Sort by" @change="filterChange" v-model="filter.sort_by">
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
                <option value="popular">Popular first</option>
            </select>
        </div>
    </div>
</template>

<script>
    export default {
        components: {},
        name: "filters",
        computed: {},
        methods: {
            filterChange() {
                let params = {};
                if (this.$route.params.slug)
                    params.slug = this.$route.params.slug

                this.$router.push({
                    name: this.routeName,
                    query: {
                        count: this.filter.count,
                        s: this.filter.s,
                        sort_by: this.filter.sort_by
                    },
                    params,
                })
            }
        },
        props: {
            routeName: String
        },
        beforeMount() {
            this.filter.count = this.$route.query.count ?? 12
            this.filter.sort_by = this.$route.query.sort_by ?? 'latest'
            this.filter.s = this.$route.query.s
        },
        data() {
            return {
                filter: {
                    sort_by: 'latest',
                    count: 12,
                    s: '',
                },
            }
        }
    }

</script>

<style lang="stylus" scoped>
    .is-relative
        margin-right 35px

        .form-control
            width 400px

        .fa
            position absolute
            top 50%
            right 20px
            transform translateY(-50%)
            color $secondary

    .filters
        display flex
        align-items center

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
