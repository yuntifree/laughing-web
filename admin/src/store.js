import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

const state = {
  // 登录状态
  logined: false,
  // 右侧试图
  view: '',
  // 试图路径
  paths: ['', ''],
  // 左侧菜单
  sidebar: [],
  tableHeight: 0,
  imgUrl: [],
  viewName: '',
  selItem: '',
}

export default new Vuex.Store({
  state,
})


//vue2.0
