import Vue from 'vue'
import ElementUI from 'element-ui'
//import VueRouter from 'vue-router'

import App from './App'

import CGI from './lib/cgi.js'
import store from './store'

Vue.use(ElementUI);
//Vue.use(VueRouter)

CGI.checkLogin(store.state);

Vue.filter('dateFormat', function(timestr, fmt) {
  return CGI.dateFormat(timestr, fmt);
})
/* eslint-disable no-new */
new Vue({
  store,
  el: '#app',
  template: '<App/>',
  components: { App }
})
