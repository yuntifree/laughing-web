<template>
  <section class="main">
    <div class="content">
      <h2>用户登录</h2>
      <div class="user">
        <i class="iconfont icon-yonghu"></i>
        <input type="text" placeholder="请输入账号" v-model="username" @focus="error = false" ref="user"/>
      </div>
      <div class="user password">
        <i class="iconfont icon-mima"></i>
        <input type="password" placeholder="请输入密码" v-model="password"
          @focus="error = false" @keyup.enter="login" ref="password"/>
      </div>
      <div class="but">
        <input class="butt" type="button" value="登录" @click="login">
      </div>
      <!-- <p class="login_error" v-if="error">用户名或者密码错误，请重新输入</p> -->
      <p class="login_error" v-if="error">{{errmsg}}</p>
    </div>
  </section>
</template>

<script>
import CGI from './lib/cgi.js'
import md5 from 'md5'
var sideBar = [{
  "title": "用户管理",
  "show": true,
  "menus": [{
    "title": "用户列表",
    "name": "getUsers",
    "icon": "yonghuxinxi"
  },{
    "title": "标签管理",
    "name": "setTags",
    "icon": "yonghuxinxi"
  },{
    "title": "审核分享",
    "name": "reviewShare",
    "icon": "yonghuxinxi"
  },{
    "title": "版本管理",
    "name": "setVersion",
    "icon": "yonghuxinxi"
  }]
}]

export default {
  data() {
    return {
      username: '',
      password: '',
      uid: 0,
      error: false,
      errmsg: ''
    }
  },
  methods: {
    login() {
      if (this.validate()) {
        CGI.post(this.$store.state, 'login',
          {username:this.username, passwd:md5(this.password)},
          (resp)=>{
          if (resp.errno === 0) {
            var data = resp.data;
            this.$store.state.username = this.username;
            // save username into localStorage
            if (localStorage) {
              try {
                localStorage.username = this.username;
              } catch(e){}
            }
            if (sessionStorage) {
              try {
                sessionStorage.menuIdx = 0;
              } catch(e) {}
            }
            this.$store.state.uid = data.uid;
            // sidebar
            this.$store.state.sidebar = this.$store.state.sidebar.concat(sideBar);
            // set login
            CGI.login(this.$store.state, data, sideBar);
            // sidebar                    
          } else {
            this.$store.state.logined = false;
            this.errmsg = resp.desc;
            this.error = true;
          }
        })
      }
    },

    validate() {
      var msg = '';
      this.username = this.username.trim();
      this.password = this.password.trim();

      do {
        if (this.username == '' || this.password == '') {
          msg = '用户名或者密码不能为空';
          break;
        }
      } while(0);
      if (msg !== '') {
        window.alert(msg);
      } else {
        return true;
      }
      return false;
    }
  },

  mounted() {
    this.username = this.$store.state.username || '';
    this.$nextTick(()=> {
      if (this.username.length > 0) {
        this.$refs.password.focus();
      } else {
        this.$refs.user.focus();
      }
    }) 
  }
}
</script>

<style>
  @import './assets/iconfont/iconfont.css';
  input,textarea,select,button{
    border:0;
    outline: none;
    background: transparent;
    box-shadow: none;
    -webkit-box-shadow:none;
    resize:none;
  }
  .main{
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0,0,0,.5);
  }
  .main .content{
    width: 360px;
    height: 250px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    box-shadow: 1px 1px 2px 0px #444;
    padding: 20px;
    border-radius: 8px;
  }
  .content h2{
    text-align: center;
    font-size: 14px;
    margin: 0;
  }
  .content .user{
    width: 218px;
    border: 1px solid #d5d5d5;
    margin:  20px  auto;
    position: relative;
    padding: 3px 10px;
    height: 30px;
    background-origin: content-box;
  }
  .user i{
   position: absolute;
   top: 2px;
   left: 15px;
  }
  .user input{
    color: #515151;
    font-size: 14px;
    position: absolute;
    top:0;
    left: 40px;
    height:30px;
    line-height: 30px;
    border: none;
    background-color: transparent;
  }
  .content .password{
    margin-top:0;
    background-origin: content-box;
  }
  .content .but{
    width: 218px;
    height: 32px;
    line-height: 32px;
    margin: 0 auto;
    font-size: 14px;
    color:#656565;
  }
  .content .but .butt{
    width:  218px;
    height: 32px;
    float: right;
    background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #3E95F0), color-stop(1, #1257E0));
    color: #fff;
    border-radius: 5px;
  }

  .login_error{
    text-align: center;
    margin-top: 20px;
    color: red;
  }
</style>