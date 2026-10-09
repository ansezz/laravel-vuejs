<!--laravelvuejs_Home_M.png-->
<template>
    <section class="search-area">
        <div class="medium-container">
            <div class="search-header is-flex baseline">
                <div class="left-area">
                    <h1 class="search-title">Search</h1>
                    <ul class="tags is-flex">
                        <li>
                            <div class="checking">
                                <input type="checkbox" id="jobs-offers" class="check">
                                <label for="jobs-offers">Jobs offers</label>
                            </div>
                        </li>
                        <li>
                            <div class="checking">
                                <input type="checkbox" id="news-feeds" class="check">
                                <label for="news-feeds">News feeds</label>
                            </div>
                        </li>
                        <li>
                            <div class="checking">
                                <input type="checkbox" id="both" class="check">
                                <label for="both">Both</label>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="right-area">
                    <img src="@/assets/images/cancel.png" alt="LV">
                </div>
            </div>
            <div class="search-body has-overlay">
                <p>The summertime sure has its fair share of distractions. The kids are out of school. There are concerts and festivals that beckon. Nature’s in full bloom and enticing us to its beaches and parks. With a million fun and distracting things going on all around us, it can be incredibly difficult to stay focused at times. But where there’s a will, there’s a way — and where there’s a problem, there’s an opportunity for a solution. Like investing in a pair of noise-cancelling headphones, or taking up some mindfulness exercises and practices to quiet and calm the mind and increase your control over your actions, thoughts, and decisions.</p>
                <p>The summertime sure has its fair share of distractions. The kids are out of school. There are concerts and festivals that beckon. Nature’s in full bloom and enticing us to its beaches and parks. With a million fun and distracting things going on all around us, it can be incredibly difficult to stay focused at times. But where there’s a will, there’s a way — and where there’s a problem, there’s an opportunity for a solution. Like investing in a pair of noise-cancelling headphones, or taking up some mindfulness exercises and practices to quiet and calm the mind and increase your control over your actions, thoughts, and decisions.</p>
                <p>The summertime sure has its fair share of distractions. The kids are out of school. There are concerts and festivals that beckon. Nature’s in full bloom and enticing us to its beaches and parks. With a million fun and distracting things going on all around us, it can be incredibly difficult to stay focused at times. But where there’s a will, there’s a way — and where there’s a problem, there’s an opportunity for a solution. Like investing in a pair of noise-cancelling headphones, or taking up some mindfulness exercises and practices to quiet and calm the mind and increase your control over your actions, thoughts, and decisions.</p>
                <p>The summertime sure has its fair share of distractions. The kids are out of school. There are concerts and festivals that beckon. Nature’s in full bloom and enticing us to its beaches and parks. With a million fun and distracting things going on all around us, it can be incredibly difficult to stay focused at times. But where there’s a will, there’s a way — and where there’s a problem, there’s an opportunity for a solution. Like investing in a pair of noise-cancelling headphones, or taking up some mindfulness exercises and practices to quiet and calm the mind and increase your control over your actions, thoughts, and decisions.</p>
            </div>
        </div>
    </section>
</template>

<script>
  export default {
    components: {},
    name: "Search"
  }
</script>

<style lang="stylus" scoped>
    .tags
        margin-top 20px
        li
            padding-right 20px
            &:last-child
                padding-right 0
        .checking
            margin-bottom 0
            label
                padding-top 3px
</style>
