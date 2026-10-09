// @astrojs/vue appEntrypoint: recreates the Nuxt runtime environment the components expect
// ($store, $route, $router, $apollo, $toast, global UI components, plugins & directives).
import { store } from './store.js'
import { router } from './router.js'
import { apollo } from './apollo.js'
import { toast } from './toast.js'
import { lazy, swiper, validate } from './directives.js'

import NuxtLink from './components/NuxtLink.vue'
import NoSsr from './components/NoSsr.vue'
import Adsbygoogle from './components/Adsbygoogle.vue'
import InfiniteLoading from './components/InfiniteLoading.vue'
import VueDisqus from './components/VueDisqus.vue'
import SocialSharing from './components/SocialSharing.vue'
import Network from './components/Network.vue'

// plugins/ui (global components)
import Container from '../components/shared/partials/grid/container.vue'
import Row from '../components/shared/partials/grid/row.vue'
import Column from '../components/shared/partials/grid/column.vue'
import Heading from '../components/shared/partials/elements/heading.vue'
import Breadcrumb from '../components/shared/partials/elements/breadcrumb.vue'
import Thumbnail from '../components/shared/partials/elements/thumbnail.vue'
import ArticleItem from '../components/shared/partials/elements/article-item.vue'
import AppForm from '../components/shared/partials/form/app-form.vue'
import AppControl from '../components/shared/partials/form/app-control.vue'

const getGqlValidationErrors = (error) => {
  if (!error || !error.graphQLErrors) return null
  let validation = null
  error.graphQLErrors.forEach((item) => { if (item.extensions && item.extensions.category === 'validation') validation = item.extensions.validation })
  return validation
}

export default (app) => {
  app.config.globalProperties.$store = store
  app.config.globalProperties.$router = router
  app.config.globalProperties.$apollo = apollo
  app.config.globalProperties.$toast = toast
  app.config.globalProperties.$utils = { getGqlValidationErrors }
  app.config.globalProperties.$nuxt = { $loading: { show: false } }
  Object.defineProperty(app.config.globalProperties, '$route', { get: () => store.state.route })

  // mixins/platforms
  app.mixin({
    computed: { platform() { return store.state.platform } },
    methods: { isWeb() { return store.state.platform === 'web' }, isMobile() { return store.state.platform === 'mobile' } },
  })

  const components = { NuxtLink, NoSsr, ClientOnly: NoSsr, Adsbygoogle, InfiniteLoading, VueDisqus, SocialSharing, Network,
    Container, Row, Column, Heading, Breadcrumb, Thumbnail, ArticleItem, AppForm, AppControl }
  for (const [name, c] of Object.entries(components)) app.component(name, c)

  app.directive('lazy', lazy)
  app.directive('swiper', swiper)
  app.directive('validate', validate)
}
