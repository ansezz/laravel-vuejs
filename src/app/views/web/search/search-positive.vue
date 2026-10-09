<!--laravelvuejs_Home_M.png-->
<template>
    <section class="search-area">
        <div class="medium-container">
            <div class="search-header is-flex is-center is-column">
                <img src="@/assets/images/icons-search.svg" alt="LV">
                <h1 class="search-title">Search for: Code</h1>
                <span class="number-found">3 Results</span>
            </div>
            <div class="search-form">
                <form class="form">
                    <div class="inputs is-flex">
                        <div class="form-group">
                            <select name="type" class="form-control has-custom">
                                <option value="1">Type</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="text" class="form-control has-custom" placeholder="use another keyword">
                            <img src="@/assets/images/icons-search.svg" alt="LV">
                        </div>
                    </div>
                    <button class="button">Search</button>
                </form>
            </div>
        </div>
        <div class="container">
            <div class="search-result">
                <article-item v-for="item in featured"
                    :title="item.title"
                    :image="item.image_url"
                    :key="item.id"
                    :to="{ name: 'slug', params: { slug: item.slug }}"
                />
            </div>
        </div>
        <app-featured />
    </section>
</template>

<script>
import __AppFeatured from '@/components/web/partials/app-featured'
import __ArticleItem from '@/components/shared/partials/elements/article-item'
export default {
    components: {
        AppFeatured: __AppFeatured,
        ArticleItem: __ArticleItem
    },
    name: "Search-Positive",
    computed: {
        featured() {
            return this.$store.state.post.featured.data
        },
    },
  }
</script>

<style lang="stylus" scoped>
    .search-title
        margin 10px 0
    .featured-articles
        padding 40px 0 0 !important
        &:after
            display none
    .search-result
        display grid
        grid-template-columns repeat(4, 1fr)
        grid-gap 30px 10px
</style>
