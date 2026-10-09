<template>
  <web-layout>
    <error-page :error="{ statusCode: 404 }"/>
  </web-layout>
</template>

<script>
  // Nuxt rendered layouts/error.vue inside the web layout for unknown routes.
  import WebLayout from '@/layouts/web.vue'
  import ErrorPage from '@/layouts/error.vue'

  export default { name: 'NotFoundRoot', components: { WebLayout, ErrorPage } }
</script>
