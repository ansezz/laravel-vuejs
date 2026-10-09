<template>
  <article class="post" :class="{ 'is-horizontal' : horizontal }">
      <header>
        <thumbnail :src="image" :alt="title" :to="to"/>
      </header>
    <main class="article-main">
      <nuxt-link aria-label="Link LV" :to="to">
        <h3 class="article-title" v-html="title"/>
      </nuxt-link>
       <!--<p v-if="description" class="article-description" v-html="truncate(description, 60)"/>-->
    </main>
  </article>
</template>

<script>
export default {
    name: "ArticleItem",
    props: {
        horizontal: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        to: {
          type: [String, Object],
          default :'/'
        },
        image: {
            type: String,
            default: null
        },
        thumb: {
            type: Boolean,
            default: null
        }
    },
    methods: {
        truncate: function (text, number) {
            if(text) {
                let textsub = text.substr(0, number),
                helpIndex = textsub.lastIndexOf(" "),
                exactIndex = number - helpIndex;
                return text.substr(0, (number - exactIndex)) + '...';
            }
            return text;
        }
    }
}
</script>

<style lang="stylus" scoped>
    .post
        position relative
        .article-main
            padding 10px 10px 0
            .article-title
                color $tertiary
                font-size 17px
                line-height 1.4
                height 50px
                overflow hidden
            .article-description
                color rgba($tertiary, .6)
                font-size 18px
                line-height 1.56
                margin-top 10px
                margin-bottom 0
        &.is-horizontal
            display flex
            align-items center
            margin-bottom 10px
            &:last-child
                margin-bottom 0
            header
                width 150px
            >>> .article-image
                height 81px
            .article-main
                padding 0 0 0 10px
                width 140px
                height 81px
                display flex
                align-items center
                .article-title
                    font-size 14px
                    font-weight 500
                    height 60px
</style>
