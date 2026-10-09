<template>
  <svg height="100" width="198" xmlns="http://www.w3.org/2000/svg">
    <g class="lv-group">
      <path
        class="lv-path"
        d="M118.1 11.52l31.925 82.343c2.4 6.183 11.016 6.183 13.412 0l31.93-82.343a7.421 7.421 0 0 0-.756-6.815 7.176 7.176 0 0 0-5.952-3.19h-63.855a7.176 7.176 0 0 0-5.949 3.192 7.421 7.421 0 0 0-.755 6.813zm0 0zm59.971 4.64l-21.337 55.041-21.343-55.04zM1.5 8.838v70.578C1.502 89.96 9.929 98.496 20.314 98.5h34.83c5.532 0 9.013-6.075 6.256-10.961L14.959 5.194C11.292-1.308 1.5 1.327 1.5 8.838zm15.923 33.216h1.492v.004h-1.5zm0 0l1.298-.733L42.71 83.854H20.314c-2.435 0-4.4-1.99-4.4-4.438V42.054zm84.162 56.445c13.594 0 24.622-11.174 24.622-24.967s-11.028-24.967-24.622-24.967-24.622 11.174-24.622 24.967 11.028 24.967 24.622 24.967zm0-14.645c-5.642 0-10.207-4.626-10.207-10.322s4.565-10.322 10.207-10.322 10.208 4.625 10.208 10.322-4.566 10.322-10.208 10.322zM76.316 51.132c13.705 0 24.816-11.11 24.816-24.816S90.022 1.5 76.316 1.5a24.816 24.816 0 1 0 0 49.632zm0-14.544c-5.673 0-10.272-4.6-10.272-10.272s4.599-10.272 10.272-10.272 10.272 4.599 10.272 10.272-4.6 10.272-10.272 10.272z"
      ></path>
    </g>
  </svg>
</template>

<style lang="stylus" scoped>
  .lv
    display flex
    justify-content center
    align-items center
    min-height 100vh
    background-color #f5f6f8

  .lv-group
    animation stroke 5s ease infinite
    stroke $primary
    stroke-width 2px
    stroke-dasharray 1200
    stroke-dashoffset 0
    stroke-linecap round
    stroke-linejoin round

  .lv-path
    animation fill 5s ease infinite
    fill $primary

  @keyframes stroke
    0%
    100%
      stroke-dashoffset 1200

    50%
      stroke-dashoffset 0

  @keyframes fill
    0%
    100%
      fill #fff

    30%
      fill $primary
</style>
