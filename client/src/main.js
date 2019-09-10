/* eslint-disable no-new */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import { sync } from 'vuex-router-sync'
import store from '@/store/store'

import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false

Vue.use(Vuetify)

sync(store, router)

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

// Vue.config.devtools = false
// Vue.config.debug = false
// Vue.config.silent = true
