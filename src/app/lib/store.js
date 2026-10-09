// Minimal Vuex-compatible store used by the ported Nuxt components.
// On the server each Astro page calls `setPageState()` in its frontmatter before
// rendering (static builds render pages one at a time), and the layout serialises
// the state into `window.__LV_STATE__`, which hydrates the store in the browser,
// exactly like Nuxt's `window.__NUXT__.state`.
import { reactive } from 'vue'
import { main_menu, second_menu, social_media } from '../config/index.js'
import { gqlRequest } from './apollo.js'

export function defaultState() {
  return {
    platform: 'web',
    navigation: { visibility: false },
    search: { visibility: false },
    social_media,
    main_menu,
    second_menu,
    route: { name: 'index', path: '/', fullPath: '/', params: {}, query: {} },
    auth: { loggedIn: false, me: null, me_token: { access_token: null, expires_at: null } },
    category: { category: null, posts: { data: [] } },
    tag: { tag: null, posts: { data: [] } },
    post: { single: null, posts: { data: [] }, featured: { data: [] }, popular: { data: [] } },
  }
}

const initial = typeof window !== 'undefined' && window.__LV_STATE__ ? window.__LV_STATE__ : defaultState()
const state = reactive(initial)

if (typeof window !== 'undefined') {
  // query strings only exist in the browser for a static site
  const query = Object.fromEntries(new URLSearchParams(window.location.search))
  state.route.query = query
  state.route.fullPath = window.location.pathname + window.location.search
}

export function setPageState(partial = {}) {
  const fresh = defaultState()
  for (const k of Object.keys(state)) delete state[k]
  Object.assign(state, fresh)
  deepMerge(state, partial)
  return state
}

export function serializeState() {
  return JSON.stringify(state).replace(/</g, '\\u003c')
}

function deepMerge(target, src) {
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) deepMerge(target[k], v)
    else target[k] = v
  }
}

const mutations = {
  SET_PLATFORM: (s, { platform }) => { s.platform = platform },
  SET_NAVIGATION_VISIBILITY: (s, val) => { s.navigation.visibility = val },
  SET_SEARCH_VISIBILITY: (s, val) => {
    s.search.visibility = val
    if (typeof document !== 'undefined') document.querySelector('html').classList[val ? 'add' : 'remove']('no-scroll')
  },
  'auth/SET_ME': (s, v) => { s.auth.me = v },
  'auth/SET_ME_TOKEN': (s, v) => { s.auth.me_token = v },
  'auth/SET_LOGGED_IN': (s, v) => { s.auth.loggedIn = v },
}

const actions = {
  toggleNavigationVisibility({ commit, state }) { commit('SET_NAVIGATION_VISIBILITY', !state.navigation.visibility) },
  toggleSearchVisibility({ commit, state }) { commit('SET_SEARCH_VISIBILITY', !state.search.visibility) },
  // Auth used the Laravel GraphQL API; it only works if PUBLIC_GRAPHQL_URL points to a live backend.
  async 'auth/LOGIN'(_, params) {
    const data = await gqlRequest('query login($email: String!, $password: String!, $remember_me: Boolean) { login(email: $email, password: $password, remember_me: $remember_me) { access_token expires_at } }', params)
    return !!(data && data.login)
  },
  async 'auth/SIGNUP'(_, params) {
    const data = await gqlRequest('mutation ($email: String!, $password: String!, $name: String!) { signup(email: $email, password: $password, name: $name) { id name email created_at } }', params)
    if (data && data.signup) window.location.href = '/auth/login'
  },
  async 'auth/SET_TOKEN'() { return true },
  async 'auth/LOAD_ME'() { return null },
  async 'auth/LOGOUT'() { window.location.href = '/' },
  async 'post/LOAD_FEATURED_POSTS'() { /* featured posts are part of the static state */ },
}

export const store = {
  state,
  getters: {},
  commit(type, payload) { mutations[type] && mutations[type](state, payload) },
  dispatch(type, payload) {
    const a = actions[type]
    return Promise.resolve(a ? a({ state, commit: store.commit, dispatch: store.dispatch }, payload) : undefined)
  },
}

// --- vuex helpers (aliased as the "vuex" module) ---
const normalize = (map) => Array.isArray(map) ? map.map(k => [k, k]) : Object.entries(map)
export const mapActions = (map) => Object.fromEntries(normalize(map).map(([k, v]) => [k, function (p) { return store.dispatch(v, p) }]))
export const mapMutations = (map) => Object.fromEntries(normalize(map).map(([k, v]) => [k, function (p) { return store.commit(v, p) }]))
export const mapState = (map) => Object.fromEntries(normalize(map).map(([k, v]) => [k, function () { return typeof v === 'function' ? v(state) : state[v] }]))
export const mapGetters = () => ({})
export default { mapActions, mapMutations, mapState, mapGetters }
