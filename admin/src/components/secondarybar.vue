<template>
  <section id="secondary_bar">
    <div class="users">
      <p><i class="glyphicon glyphicon-user second-icon-user"></i>{{user}}(<a href="javascript:;" @click="logout">退出登录</a>)</p>
    </div>
    <div class="breadcrumbs_container">
      <article class="breadcrumbs"><a href="javascript:;">{{paths[0]}}</a>
        <div class="breadcrumb_divider"></div>
        <a class="current">{{paths[1]}}</a></article>
    </div>
  </section>
</template>
<script>
import CGI from '../lib/cgi.js'

export default {
  props: {
    user: String,
    path: String,
  },
  computed: {
    paths() {
      return this.$store.state.paths;
    }
  },
  methods: {
    logout() {
      CGI.logout(this.$store.state);
    }
  }
}
</script>
<style>
@import '../assets/iconfont/iconfont.css';
section#secondary_bar {
  height: 5%;
  width: 100%;
  /* background: #F1F1F4 url(../assets/images/secondary_bar.png) repeat-x; */
  background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #fefefe), color-stop(1, #E5E6EC));
  background-image: gradient(linear, left top, left bottom, color-stop(0, #fefefe), color-stop(1, #E5E6EC));
  border-bottom: 1px solid #BAC2CC;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  box-shadow: 2px 4px 5px #E5E6EC;
}

section#secondary_bar .user,
.users {
  float: left;
  width: 15%;
}

.user p,
.users p {
  margin: 0;
  padding: 0;
  color: #666666;
  font-weight: bold;
  display: block;
  width: 100%;
  text-shadow: 0 1px 0 #fff;
  padding-left: 6%;
}

.user a {
  text-decoration: none;
  color: #666666;
}

.user a:hover {
  color: #77BACE;
}

.user a.logout_user {
  float: left;
  display: block;
  width: 16px;
  height: 5%;
  text-indent: -5000px;
  background: url(../assets/images/icn_logout.png) center no-repeat;
}


/* Breadcrumbs */

section#secondary_bar .breadcrumbs_container {
  float: left;
  width: 80%;
}

article.breadcrumbs {
  float: left;
  padding: 0 10px;
  border: 1px solid #ccc;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  -webkit-box-shadow: 0 1px 0 #fff;
  -moz-box-shadow: 0 1px 0 #fff;
  box-shadow: 0 1px 0 #fff;
  height: 25px;
  margin: 4px 3%;
  box-sizing: border-box;
}

.breadcrumbs a {
  display: inline-block;
  float: left;
  height: 24px;
  line-height: 23px;
}

.breadcrumbs a.current,
.breadcrumbs a.current:hover {
  color: #9E9E9E;
  font-weight: bold;
  text-shadow: 0 1px 0 #fff;
  text-decoration: none;
}

.breadcrumbs a:link,
.breadcrumbs a:visited {
  color: #44474F;
  text-decoration: none;
  text-shadow: 0 1px 0 #fff;
  font-weight: bold;
}

.breadcrumbs a:hover {
  color: #222222;
}

.breadcrumb_divider {
  display: inline-block;
  width: 12px;
  height: 24px;
  background: url(../assets/images/breadcrumb_divider.png) no-repeat;
  float: left;
  margin: 0 5px;
}

.second-icon-user {
  font-size: 14px;
}
</style>
