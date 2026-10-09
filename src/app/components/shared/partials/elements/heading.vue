<template>
  <div class="heading">
      <h3 class="heading-title">
        <div class="img-left">
            <img src="@/assets/images/elements-style-left.svg" alt="LV">
        </div>
         <slot/>
         <div class="img-right">
             <img src="@/assets/images/elements-style-right.svg" alt="LV">
         </div>
      </h3>
  </div>
</template>

<script>
  export default {
    name: 'Heading'
  }
</script>

<style lang="stylus" scoped>
  .heading
    display inline-block
    .heading-title
        color $secondary
        font-weight bold
        font-size 16px
        display flex
        align-items center
        justify-content space-between
        .img-left,
        .img-right
            color #F0F
</style>
