<template>
  <div class="pagination-container" v-if="data">
    <renderless :data="data" :limit="limit"
                v-on:pagination-change-page="onPaginationChangePage">
      <template v-slot="{ data, limit, computed }">
      <ul class="app-pagination" v-if="computed.total > computed.perPage">

        <li class="pagination-link">
          <nuxt-link aria-label="Link LV" to="/">
            <i class="fa fa-caret-left"></i> <i class="fa fa-caret-left"></i>
          </nuxt-link>
        </li>

        <li class="pagination-link" :class="{'disabled': computed.currentPage === 1}">
          <a href="#" @click="onPaginationChangePage(computed.currentPage-1)">
            <i class="fa fa-caret-left"></i>
          </a>
        </li>

        <li class="pagination-link" v-for="(page, key) in computed.pageRange" :key="key"
            :class="{ 'active': page === computed.currentPage }">
          <a href="#" @click="onPaginationChangePage(page)" :class="{'current-link' : computed.currentPage === page}">
            {{ page }}
          </a>
        </li>

        <li class="pagination-link" :class="{'disabled': !computed.hasMorePages}">
          <a href="#" @click="onPaginationChangePage(computed.currentPage+1)"> <i class="fa fa-caret-right"></i></a>
        </li>

        <li class="pagination-link" :class="{'disabled': !computed.hasMorePages}">
          <nuxt-link aria-label="Link LV" to="/">
            <i class="fa fa-caret-right"></i><i class="fa fa-caret-right"></i>
          </nuxt-link>
        </li>

      </ul>
      </template>
    </renderless>
  </div>
</template>

<script>
  import Renderless from './renderless.vue';

  export default {
    props: {
      data: {
        type: Object,
        default: () => {
        }
      },
      limit: {
        type: Number,
        default: 5
      }
    },
    methods: {
      getRouteQuery(page) {
        let query = this.$route.query;
        query.page = page
        console.log(query)
        return query;
      },
      getPageRoute(page, plus) {
        let query = this.$route.query;
        query.page = page + plus
        return {to: this.$route.name, query}
      },
      onPaginationChangePage(page) {
        this.$emit('pagination-change-page', page);
      }
    },
    components: {
      Renderless
    }
  }
</script>

<style lang="stylus" scoped>
  .pagination-container
    margin-top 40px

  .app-pagination
    display flex
    align-items center
    justify-content center

    li
      padding-right 20px

      a
        display flex
        align-items center
        justify-content center
        width 40px
        height 40px
        font-size 12px
        font-weight 600
        color $secondary
        transition all .35s ease-in-out

        &:hover
          background-color $primary

      &.pagination-link
        a
          background-color rgba($secondary, .03)

      &.current-link
        a
          background-color $primary

      &:last-child
        padding-right 0
</style>
