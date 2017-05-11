
(function() {
  adapt();
  var id = ~~(query().id);
  var data = {};
  post('get_share_detail',{id: id}, function(resp) {
    console.log(1);
    if (resp.errno === 0) {
      data = resp.data;
      $('.container').append(template('tplInfo', data));
    } else {
      tipShow(resp.desc);
    }
  })
})()

function adapt() {
  if (document && window) {
    // init font
    var docEl = document.documentElement;
    var isIOS = navigator.userAgent.match(/iphone|ipod|ipad/gi);
    var dpr = isIOS ? Math.min(window.devicePixelRatio, 3) : 1;
    dpr = window.top === window.self ? dpr : 1; //被iframe引用时，禁止缩放
    var scale = 1 / dpr;
    var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

    docEl.dataset.dpr = dpr;
    var metaEl = document.createElement('meta');
    metaEl.name = 'viewport';
    metaEl.content = 'initial-scale=1,maximum-scale=1, minimum-scale=1';
    docEl.firstElementChild.appendChild(metaEl);
    var recalc = function() {
        var width = docEl.clientWidth;
        if (width / dpr > 750) {
            width = 750 * dpr;
        }
        docEl.style.fontSize = 100 * (width / 750) + 'px';
    };
    recalc();
    if (!document.addEventListener) return;
    window.addEventListener(resizeEvt, recalc, false);
  }
}

function query() {
    var url = window.document.location.href.toString();
    url = url.substr(url.indexOf('?') + 1);
    if (typeof(url) === 'string') {
        var u = url.split('&');
        var get = {};
        for (var i in u) {
            if (typeof(u[i]) === 'string') {
                var j = u[i].split('=');
                get[j[0]] = j[1];
            }
        }
        return get;
    } else {
        return {};
    }
}
var ajax = $.ajax;
var CGI = 'http://120.76.236.185:81/'
function post(action, param, callback) {
  var p = {
    data: param
  };

  var url = CGI + action;

  try {
    ajax({
      type: 'POST',
      url: url,
      contentType: 'application/json',
      dataType: 'json',
      timeout: 5000,
      data: JSON.stringify(p),
      success: function(data) {
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
    console.log(JSON.stringify(e));
  }
}


function tipShow(val) {
  $('.tip-info').text(val);
  $('.tip-info').show();
  setTimeout(function() {
    $('.tip-info').hide();
  }, 2000);
}