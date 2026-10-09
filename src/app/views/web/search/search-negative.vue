<!--laravelvuejs_Home_M.png-->
<template>
    <section class="search-area">
        <div class="medium-container">
            <div class="search-header is-flex is-center is-column">
                <img src="@/assets/images/icons-search.svg" alt="LV">
                <h1 class="search-title">Search for: htyt</h1>
                <span class="number-found">0 Results</span>
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
            <div class="search-error text-center">
                <p>Sorry. but we didn’t anything. Please try again with deferent keywords.</p>
                <div class="error-img">
                    <img src="@/assets/images/search-error.png" alt="LV">
                </div>
            </div>
        </div>
        <app-featured />
    </section>
</template>

<script>
import __AppFeatured from '@/components/web/partials/app-featured'
export default {
    components: {
        AppFeatured: __AppFeatured
    },
    name: "Search-Negative"
  }
</script>

<style lang="stylus" scoped>
    .search-title
        margin 10px 0
    .featured-articles
        padding 40px 0 0 !important
        &:after
            display none
</style>
