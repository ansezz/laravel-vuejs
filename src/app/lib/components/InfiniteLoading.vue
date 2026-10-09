<template>
  <div class="infinite-loading-container">
    <div class="infinite-status-prompt" v-show="status === 'loading'"><i class="fa fa-spin fa-spinner"></i></div>
    <div class="infinite-status-prompt" v-show="status === 'complete'"></div>
  </div>
</template>

<script>
  // Minimal stand-in for vue-infinite-loading: emits `infinite` with a $state object when visible.
  export default {
    name: 'InfiniteLoading',
    emits: ['infinite'],
    data: () => ({ status: 'ready' }),
    mounted() {
      const $state = {
        loaded: () => { this.status = 'ready'; this.$nextTick(() => this.check()) },
        complete: () => { this.status = 'complete'; this.observer && this.observer.disconnect() },
      }
      this.$state = $state
      this.observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) this.check() }, { rootMargin: '100px' })
      this.observer.observe(this.$el)
    },
    beforeUnmount() { this.observer && this.observer.disconnect() },
    methods: {
      check() {
        if (this.status !== 'ready') return
        this.status = 'loading'
        this.$emit('infinite', this.$state)
      },
    },
  }
</script>
