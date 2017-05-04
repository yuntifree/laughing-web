<template>
  <div id="app" class="oss">
    <template v-if="logined">
      <uheader welcome="欢迎来到管理后台"></uheader>
      <secondarybar :user="user" path="首页"></secondarybar>
      <sidebar :sidebars="sidebars"></sidebar>
      <section id="main" class="column" ref="container">
        <transition name="fade" mode="out-in">
          <components :is="currentView"></components>
        </transition> 
      </section>
    </template>
    <template v-else>
      <login></login>
    </template>
  </div>
</template>
<script>
import uheader from './components/header.vue'
import secondarybar from './components/secondarybar.vue'
import sidebar from './components/sidebar.vue'
import Login from './login.vue'

// import views
import getUsers from './components/views/getUsers.vue'
import whiteList from './components/views/whitelist.vue'
export default {
  name: 'app',
  data() {
    return {}
  },

  computed: {
    currentView() {
      return this.$store.state.view;
    },
    logined() {
      return this.$store.state.logined;
    },
    user() {
      return this.$store.state.username + ' 你好';
    },
    sidebars() {
      return (this.$store.state.sidebar);
    }
  },
  components: {
    uheader,
    secondarybar,
    sidebar,
    getUsers,
    Login,
    whiteList
  },
  // for share components View using.
  mounted() {
    this.$nextTick(()=> {
      this.$store.state.viewName = this.currentView;
    })
  },
}
</script>
<style lang="scss">
@import './assets/css/css.css',
'./assets/iconfont/iconfont.css',
'./assets/css/common.scss';
html,
body,
.oss {
  @include containerSize(100%,100%);
  overflow: hidden;
}

ul,
li,
ol {
  list-style: none;
}

.fade-transition {
  @include containerSize(100%,100%);
  transition: opacity .2s ease;
  overflow: hidden;
}

.fade-enter,
.fade-leave {
  opacity: 0;
}

section#main {
  @include containerSize(85%,87%);
  float: left;
  margin-top: -2px;
  padding: 10px 1% 0;
}
.mana_container {
  @include containerSize(100%,100%);
}
#main h3 {
  color: #1F1F20;
  text-shadow: 0 1px 0 #fff;
  font-size: 14px;
}

.module {
  @include containerSize(100%,100%);
  padding: 40px 0 35px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.tabs {
  padding: 0;
  float: right;
  list-style: none;
  border-radius: 5px;
  margin: 0;
}

.tabs li {
  float: left;
  margin: 0;
  padding: 0;
  margin-left: 10px;
}

.app_header {
  min-height: 40px;
  margin: -40px 0 0;
  display: flex;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.quick_search {
  -webkit-border-radius: 20px;
  -moz-border-radius: 20px;
  border-radius: 20px;
  border: 1px solid #bbb;
  height: 26px;
  width: 200px;
  -webkit-box-shadow: inset 0 2px 2px #ccc, 0 1px 0 #fff;
  -moz-box-shadow: inset 0 2px 2px #ccc, 0 1px 0 #fff;
  box-shadow: inset 0 2px 2px #ccc, 0 1px 0 #fff;
  padding-left: 5px;
  position: relative;
  font-weight: normal;
  line-height: 24px;
  display: inline-block;
}

.quick_search .iconfont {
  font-size: 14px;
  color: #ccc;
}

#main .module header h3.tabs_involved {
  display: block;
  float: left;
  margin-left: 20px;
  margin-top: 15px;
}

.mana_header .btn {
  padding: 0;
  padding: 3px 10px;
  border: 0;
  box-sizing: border-box;
}

.btn {
  border: 0;
}

.btn:hover {
  background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #fefefe), color-stop(1, #E5E6EC));
  background-image: gradient(linear, left top, left bottom, color-stop(0, #fefefe), color-stop(1, #E5E6EC));
}

.choosed {
  background-color: #99bce8 !important;
}

button>i {
  margin-right: 3px;
}

.head-ops {
  padding: 0;
}

.outline-none {
  border-color: transparent;
}

.red {
  color: red;
}

.img120 {
  @include containerSize(120px,auto);
}

.img50 {
  @include containerSize(50px,50px);
}

.search-tip {
  background-color: #444;
  border-color: #444;
  color: #fff;
  width: auto;
  height: auto;
}

.search-tip .close {
  color: #fff;
  text-shadow: none;
  opacity: 1;
}

.tips {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.btn:hover {
  background-image: none;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
.shade {
  @include containerSize(100%,100%);
  @include pos(top,0,left,0);
  background-color: rgba(0,0,0,0.5);
  z-index: 10;
}
.el-pagination {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}
.edit-form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: 1px solid rgba(0,0,0,.2);
  box-shadow:0 3px 9px rgba(0,0,0,0.5);
  border-radius: 6px;
  padding: 10px;
  max-width:600px;
  width: 70%;
  height: auto;
  max-height: 60%;
  overflow: auto
}
.el-alert {
  width: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 500;
}
.el-alert--dark {
  background-color: rgba(0,0,0,0.8);
}
.el-table .cell {
  padding: 10px;
  text-align: center;
}
.el-date-editor {
  border: 1px solid #c0ccda;
  border-radius: 4px;
}
.el-date-editor:hover {
    border-color: #8492a6;
}
.el-date-editor__editor {
  width: 90%;
}
.el-icon-date,
.el-icon-time {
  color: #c0ccda;
}
.is-active {
  border-color: #20a0ff !important;;
}
.line {
  text-align: center;
}
.btn-ssm {
  padding: 2px 10px;
  border:1px solid #ccc
}
.form-title {
  width: 100%;
  border-bottom: 1px solid #ccc;
  line-height: 40px;
  margin-bottom: 10px;
  font-weight: bold;
}
</style>
