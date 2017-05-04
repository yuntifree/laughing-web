var ajax = require('./ajax')
//var ajax = $.ajax;

module.exports = {
  //HOST: __DEV__ ? 'http://114.55.36.175':'',
  HOST: __DEV__ ? 'http://120.76.236.185:8080':'',
  //CGI: '/oss-bin/',
  CGI: '/',
  get(state, action, param, callback) {
    if (param.uid == undefined && action != 'login') {
      param.uid = state.uid;
      param.token = state.token;
    }
    // debug
    param.debug = 1;

    var url = [
      this.HOST, //连接远端程序
      this.CGI,
      action + '?',
      this.makeParam(param)
    ].join('');

    var opt = {
      type: 'GET',
      url: url,
      contentType: 'application/json',
      cache: false,
      timeout: 4000,
      dataType: 'jsonp',
      jsonp: 'callback',
      success: function(data) {
        if (data.errno === 101) {
          state.logined = false;
        } else {
          callback(data);
        }
      },
      error: function(req, text) {
        callback({
          errno: 99,
          desc: '网络有些慢，请稍后重试:' + text
        });
      }
    };
    // call ajax
    try {
      ajax(opt);
    } catch (e) {
      if (__DEV__) {
        alert(JSON.stringify(e));
      }
    }
  },

  post(state, action, param, callback) {
    var p = {
      uid: ~~(state.uid),
      token: state.token,
    };

    p.data = param;
    var self = this;

    var url = this.CGI + action;
    try {
      ajax({
        type: 'POST',
        url: url,
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        data: JSON.stringify(p),
        success: function(data) {
          /*if (data.errno === 101) {
            if (state.logined)
              self.logout(state);
          }*/
          callback(data);
        },
        error: function() {
          callback({
            errno: 99,
            desc: '网络有些慢，请稍后重试~'
          });
        }
      });
    } catch (e) {
      if (__DEV__) {
        alert(JSON.stringify(e));
      }
    }
  },

  login(state, data) {
    //console.log(state);
    state.uid = data.uid;
    state.token = data.token;

    sessionStorage.uid = data.uid;
    sessionStorage.token = data.token;
    sessionStorage.sidebar = JSON.stringify(data.roleconf);

    state.logined = true;
    //console.log(state.logined);
  },

  logout(state) {
    sessionStorage.clear();
    state.logined = false;
    window.location.reload();
  },

  checkLogin(state) {
    var menus;
    try {
      menus = JSON.parse(sessionStorage.menus);
    } catch (e) {

    }
    state.uid = ~~sessionStorage.uid || 0;
    state.token = sessionStorage.token || '';
    state.username = localStorage.username || '';
    if (menus) {
      state.view = menus.view;
      state.paths = menus.paths;
    }

    if (state.token != '') {
      state.logined = true;
      try {
        state.sidebar = JSON.parse(sessionStorage.sidebar);
      } catch (e) {
        state.sidebar = [];
      }
    }
  },

  makeParam(param) {
    var ret = [];
    for (var idx in param) {
      ret.push(idx + '=' + encodeURIComponent(param[idx]));
    }
    return ret.join('&');
  },

  dateFormat(date, fmt) {
    var dateStr = (date+'').replace(/-/g,"/");
    var d = new Date(dateStr);
    if (isNaN(d.getDate())) {
      return 'Invalid date'
    }
    var o = {
      'y+': d.getFullYear(),
      'M+': d.getMonth() + 1, //月份
      'd+': d.getDate(), //日
      'h+': d.getHours(), //小时
      'm+': d.getMinutes(), //分
      's+': d.getSeconds(), //秒
      'q+': Math.floor((d.getMonth() + 3) / 3), //季度
      //'S': d.getMilliseconds() //毫秒
    };

    //o['S'] = ('000' + o['S']).substr(('' + o['S']).length);
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp('(' + k + ')').test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
  },
  // async load js
  Myload(B, A) {
    this.done = false;
    B.onload = B.onreadystatechange = function() {
      if (!this.done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
        this.done = true;
        A();
        B.onload = B.onreadystatechange = null;
      }
    };
  },
  loadScript(A, id, C) {
    var B = function() {};
    if (C !== undefined) {
      B = C;
    }
    if (!document.getElementById(id)) {
      var D = document.createElement("script");
      D.setAttribute("src", A);
      D.setAttribute("id", id);
      document.body.appendChild(D);
      this.Myload(D, B);
    } else {
      B();
    }
  },
  // object operate
  objModified(objOld, objNew) {
    var modified = {};
    for (var p in objOld) {
      if (objNew.hasOwnProperty(p)) {
        if (objOld[p] != objNew[p]) {
          modified[p] = objNew[p];
        }
      }
    }
    return modified;
  },
  arrjModified(arrOld, arrNew) {
    if (!arrOld) {
      arrOld = [];
    }
    if (!arrNew) {
      arrNew = [];
    }
    var modified = [];
    var newLen = arrNew.length;
    var oldLen = arrOld.length;
    for(var i = 0; i < arrOld; i++){
        var obj = arrOld[i];
        var num = obj.img;
        var isExist = false;
        for(var j = 0; j < newLen; j++){
            var aj = arrOld[j];
            var n = aj.img;
            if(n == num){
                isExist = true;
                break;
            }
        }
        if(!isExist){
            modified.push(obj);
        }
    }
    return modified;
  },
  arrjModifiedGid(arrOld, arrNew) {
    var newLen = arrNew.length;
    var oldLen = arrOld.length;
    for(var i = 0; i < oldLen; i++){
        var obj = arrOld[i];
        var num = obj.img;
        var isExist = false;
        for(var j = 0; j < newLen; j++){
            var aj = arrNew[j];
            var n = aj.img;
            if(n == num){
                arrOld[i].id = arrNew[j].id;
            }
        }
    }
    return arrOld;
  },
  extend(objOld, objNew) {
    for (var p in objNew) {
      if (objOld.hasOwnProperty(p)) {
        if (objOld[p] != objNew[p]) {
          objOld[p] = objNew[p];
        }
      }
    }
  },
  clone(obj) {
    var ret = {};
    for (var p in obj) {
      ret[p] = obj[p];
    }
    return ret;
  },
  objClear(obj) {
    for (var p in obj) {
      switch (typeof(obj[p])) {
        case 'number':
          obj[p] = 0;
          break;
        case 'string':
          obj[p] = '';
          break;
        case 'boolean':
          obj[p] = false;
          break;
        case 'object':
          if (!obj[p]) {
            break;
          } else if (obj[p].constructor == Array) {
            obj[p] = [];
          } else {
            obj[p] = {};
          }
          break;
        default:
          break;
      }
    }
  },
  emptyObj(obj) {
    for(var key in obj){
      return false
    };
    return true
  },
  checkTel(tel) {
    var isPhone = /^([0-9]{3,4})?[0-9]{7,8}$/;
    var isMob = /^((\+?86)|(\(\+86\)))?(1[0-9]{10})$/;
    //var isNum=/^\+?[1-9][0-9]||isNum.test(tel)*$/;
    var ret = isMob.test(tel) || isPhone.test(tel);
    return ret;
  },

  compareTime(starttime, endtime) {
    var ret = '';
    if (starttime) {
      if (!endtime) {
        ret = '请填写完整时间';
      }
    }

    if (endtime) {
      if (!starttime) {
        ret = '请填写完整时间';
      }
    }
    if (starttime && endtime) {
      var stime = new Date(starttime).getTime();
      var expire = new Date(endtime).getTime();
      if (stime > expire) {
        ret = '开始时间不能大于截止时间';
      }
    }
    return ret;
  },
  /*totalPages(total, limit) {
    var ret = 1;
    if (total % limit == 0) {
      ret = total / limit;
    } else {
      ret = ~~(total / limit) + 1;
    }
    return ret;
  },*/

  // v-validator Format
  vFormat: {
    vNumber: {
      number: true
    },
    vRequired: {
      required: true
    },
    vMax20: {
      maxlength: 20
    },
    vMax30: {
      maxlength: 30
    },
    vRequiredMax20: {
      required: true,
      maxlength: 20
    },
    vRequiredNumber: {
      number: true,
      required: true
    }
  }

  // setCookie(key, val, min) {
  //     var t = new Date();
  //     t.setTime(t.getTime() + min * 60 * 1000);
  //     document.cookie = key + "=" + escape(val) + ";path=/" + (min === 0 ? "" : ";expires=" + t.toGMTString());
  // },

  // //读取cookie
  // getCookie(name) {
  //     var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
  //     if (arr !== null)
  //         return unescape(arr[2]);
  //     return null;
  // },
}
