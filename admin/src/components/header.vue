<template>
  <header id="header">
    <h1 class="site_title"><a href="index.html">管理后台</a></h1>
    <h2 class="section_title">{{welcome}}</h2>
    <div class="btn_view_site"><a href="http://www.aini25.com">主页</a></div>
  </header>
</template>
<script>
export default {
  props: {
    welcome: String,
  }
}
</script>
<style>
header#header {
  height: 8%;
  width: 100%;
  /*background-image: -webkit-gradient(linear, center top, center bottom, from(#505050), to(#101010));*/
  background-image: linear-gradient(to bottom, #505050, #202020, #101010, #202020, #505050);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

header#header h1.site_title,
header#header h2.section_title {
  font-size: 22px;
  font-weight: normal;
  text-shadow: 0 -1px 0 #000;
  color: #fff;
  margin: 0;
}

header#header h1.site_title {
  flex: 2;
  text-align: center;
}

header#header h1.site_title a {
  color: #fff;
  text-decoration: none;
}

header#header h2.section_title {
  text-align: center;
  flex: 7;
}

.btn_view_site {
  float: left;
  flex: 1;
}

.btn_view_site a {
  display: block;
  height: 27px;
  text-align: center;
  line-height: 29px;
  color: #fff;
  text-decoration: none;
  text-shadow: 0 -1px 0 #000;
}

.btn_view_site a:hover {
  background-position: 0 -27px;
}
</style>
