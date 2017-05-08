<template>
  <aside id="sidebar" class="column">
    <template>
      <div v-for="(menu,idx) in menus">
        <h3 @click="showMenu(idx)">{{menu.title}}</h3>
        <ul class="toggle" v-show="menu.show">
          <li v-for="item in menu.menus" :class="{checked: selItem == item.title}" @click="onSelect(menu.title, item.title, item.name)">
            <i :class="['iconfont', 'icon-' + item.icon]"></i>
            <a :href="item.url">{{item.title}}</a>
          </li>
        </ul>
      </div>
    </template>
    <footer class="sidebar-footer">
      <p><strong>Copyright &copy; 2016 云行智慧</strong></p>
      <p></p>
    </footer>
  </aside>
  <!-- end of sidebar -->
</template>
<script>
import CGI from '../lib/cgi.js'
export default {
  data() {
    return {
      selItem: '',
      menus: [],
      menuItem: 0
    }
  },
  mounted() {
    this.menus = this.$store.state.sidebar;
    var viewName = '';
    var viewTitle = '';
    var subTitle = '';
    if (sessionStorage) {
      try {
        viewName = sessionStorage.getItem('viewName');
        viewTitle = sessionStorage.getItem('viewTitle');
        subTitle = sessionStorage.getItem('subTitle');
      } catch(e) {}
    }
    for (var i=0; i<this.menus.length; i++) {
      for (var j=0; j<this.menus[i].menus.length; j++) {
        if (this.menus[i].menus[j].title == subTitle) {
          this.selItem = subTitle;
          this.menus[0].show = false;
          this.menus[i].show = true;
          this.$store.state.paths = [viewTitle, subTitle];
          this.$store.state.view = viewName;
          break;
        }
      }
    }
    if (!viewName) {
      this.$store.state.paths = [this.$store.state.sidebar[0].title, this.$store.state.sidebar[0].menus[0].title];
      this.selItem = this.$store.state.selItem = this.$store.state.paths[1];
      this.$store.state.view = this.$store.state.sidebar[0].menus[0].name;
    }   
    if (sessionStorage) {
      try {
        sessionStorage.menus = JSON.stringify({
          view: this.$store.state.view,
          paths: this.$store.state.paths,
        });
      } catch(e) {}
    } 
  },
  methods: {
    onSelect(title, subtitle, view) {
      this.$store.state.view = view;
      this.$store.state.paths = [title, subtitle];
      this.selItem = this.$store.state.selItem = subtitle;
      this.$store.state.viewName = view;
      if (sessionStorage) {
        try {
          sessionStorage.setItem('viewName', view);
          sessionStorage.setItem('viewTitle', title);
          sessionStorage.setItem('subTitle', subtitle); 
          this.menus[this.menuIdx].show = false;
        } catch(e){}
      }
    },
    showMenu(idx) {
      this.menus[idx].show = !this.menus[idx].show;  
      if (sessionStorage) {
        try {
          this.menuIdx = sessionStorage.getItem('menuIdx');
          sessionStorage.setItem('menuIdx', idx);
        } catch(e){}
      }
    }
  }
}
</script>
<style lang="scss">
@import '../assets/iconfont/iconfont.css';
@import '../assets/css/common.scss';
aside#sidebar {
  @include containerSize(15%, 80%);
  background: #E0E0E3;
  float: left;
  box-shadow: 2px 2px 5px #B6B7B9;
  padding-bottom: 20px;
  overflow-y: auto;
}

#sidebar h3 {
  color: #1F1F20;
  text-transform: uppercase;
  text-shadow: 0 1px 0 #fff;
  font-size: 14px;
  margin: 0 0 0 6%;
  display: block;
  float: left;
  width: 90%;
  line-height: 32px;
}
#sidebar .yyq-title {
  margin: 0 0 0 10%;
  color: #666;
}
.toggleLink {
  color: #999999;
  font-size: 10px;
  text-decoration: none;
  display: block;
  float: right;
  margin-right: 2%;
}

#sidebar .toggleLink:hover {
  color: #77BACE;
  text-decoration: none;
}

#sidebar ul {
  clear: both;
  margin: 0;
  padding: 0;
}

#sidebar li {
  list-style: none;
  padding-left: 12%;
}

#sidebar li a {
  color: #666666;
  text-decoration: none;
  display: inline-block;
  height: 17px;
  line-height: 17px;
  text-shadow: 0 1px 0 #fff;
  margin: 2px 0;
  font-size: 14px
}

#sidebar p {
  color: #666666;
  padding-left: 6%;
  text-shadow: 0 1px 0 #fff;
}

#sidebar a {
  color: #666666;
  text-decoration: none;
}

#sidebar a:hover {
  text-decoration: underline;
}

.sidebar-footer {
  width: 15%;
  height: 7%;
  line-height: 40px;
  border-top: 1px solid #ccc;
  box-shadow: 0 1px 0 #f0f0f2 inset;
  position: absolute;
  left: 0;
  bottom: 0;
  background: #E0E0E3;
  box-shadow: 2px 2px 5px #B6B7B9;
  padding-bottom: 20px;
}

#sidebar .checked a,
#sidebar .checked i {
  color: blue;
  text-shadow: none;
}

.checked {
  background-color: #1aa3c8;
}
</style>
