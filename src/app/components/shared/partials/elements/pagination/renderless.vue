<script>
  export default {
    props: {
      data: {
        type: Object,
        default: () => {
        }
      },
      limit: {
        type: Number,
        default: 0
      }
    },
    computed: {
      currentPage() {
        return this.data.currentPage;
      },
      lastPage() {
        return this.data.lastPage;
      },
      perPage() {
        return this.data.perPage;
      },
      hasMorePages() {
        return this.data.hasMorePages;
      },
      total() {
        return this.data.total;
      },
      pageRange() {
        if (this.limit === -1) {
          return 0;
        }
        if (this.limit === 0) {
          return this.lastPage;
        }
        let current = this.currentPage;
        let last = this.lastPage;
        let delta = this.limit;
        let left = current - delta;
        let right = current + delta + 1;
        let range = [];
        let pages = [];
        let l;
        for (let i = 1; i <= last; i++) {
          if (i === 1 || i === last || (i >= left && i < right)) {
            range.push(i);
          }
        }
        range.forEach(function (i) {
          if (l) {
            if (i - l === 2) {
              pages.push(l + 1);
            } else if (i - l !== 1) {
              pages.push('...');
            }
          }
          pages.push(i);
          l = i;
        });
        return pages;
      }
    },
    methods: {
      previousPage() {
        this.selectPage((this.currentPage - 1));
      },
      nextPage() {
        this.selectPage((this.currentPage + 1));
      },
      selectPage(page) {
        if (page === '...') {
          return;
        }
        this.$emit('pagination-change-page', page);
      }
    },
    render() {
      return this.$slots.default({
        data: this.data,
        limit: this.limit,
        computed: {
          hasMorePages: this.hasMorePages,
          currentPage: this.currentPage,
          lastPage: this.lastPage,
          perPage: this.perPage,
          total: this.total,
          pageRange: this.pageRange
        }
      });
    }
  }
</script>
