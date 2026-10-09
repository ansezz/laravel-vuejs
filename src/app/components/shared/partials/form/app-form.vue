<template>
  <form class="form" @submit.prevent="submit">
    <header>
        <slot name="desc" />
    </header>
    <main class="form-controls">
      <slot/>
    </main>
    <footer class="form-actions">
      <slot name="actions"/>
    </footer>
  </form>
</template>

<script>
export default {
  name: "AppForm",
  props: {
    submit :{
      type:Function
    }
  }
}
</script>

<style lang="stylus" scoped>
    .form-controls
        margin-bottom 10px
        .form-group
            position relative
            margin-bottom 0
            .form-control
                height 40px
                border-radius 0
                border 0
                box-shadow none
                color $secondary
                text-transform uppercase
                font-size 12px
                font-weight 600
                letter-spacing 2px
                padding-left 40px
                &::placeholder
                    color $secondary
            .img
                position absolute
                top 0
                left 0
                width 40px
                height 100%
                display flex
                align-items center
                justify-content center
                .fa
                  font-size 15px
                  color $secondary

  .form-actions
    display flex
    justify-content space-between
    align-items center
    &:empty
      display none
</style>
