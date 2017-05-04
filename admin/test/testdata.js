// login user
module.exports.login = {
  admin: {
    password: '123456',
    uid: 10000,
    skey: '123456',
    type: 'admin',
  },
  user: {
    password: '654321',
    uid: 10002,
    skey: '654321',
    type: 'user',
  }
};

// menus
var regInfo = {
  title: '注册留存',
  menus: [{
    title: '注册总计',
    name: 'manage',
    icon: 'search',
  }, {
    title: '留存用户',
    name: 'stats',
    icon: 'search',
  }]
};

var activeInfo = {
  title: '用户活跃',
  menus: [{
    title: '日活总计',
    name: 'activeDay',
    icon: 'search',
  }, {
    title: '月活统计',
    name: 'activeMonth',
    icon: 'search',
  }]
};

var systemInfo = {
  title: '后台管理',
  menus: [{
    title: '用户权限',
    name: 'systemUser',
    icon: 'search',
  }, {
    title: '系统日志',
    name: 'systemLog',
    icon: 'search',
  }]
};

module.exports.getEdition = {
  editionList: [{
    name: 'global.json',
    versions: [{
      spec: '版本1.0',
      version: '1.0',
      online: 1,
      desc: {
        "abc": "123"
      },
    }, {
      spec: '版本1.1',
      version: '1.1',
      online: 0,
      desc: {},
    }],
  }, {
    name: 'config.json',
    versions: [{
      spec: '说明1.0',
      version: '1.0',
      online: 1,
      desc: {},
    }, {
      spec: '说明1.1',
      version: '1.1',
      online: 0,
      desc: {},
    }]
  }, ]
};

module.exports.menus = {
  admin: [regInfo, activeInfo, systemInfo],
  user: [regInfo, activeInfo],
};

module.exports.getBars = {
    backgroundColor: '#fff',
    title: {
      text: '某站点用户访问来源',
      subtext: '纯属虚构',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
    },
    series: [{
      name: '访问来源',
      type: 'pie',
      radius: '55%',
      center: ['50%', '60%'],
      legendHoverLink: false,
      hoverAnimation: 'multiple',
      label: {
        normal: {
          position: 'outside',
          emphasis: {
            show: true,
            textStyle: {
              color: 'rgb(0,255,255)',
            }
          }
        }
      },
      radius: ['50%', '70%'],
      data: [{
        value: 335,
        name: '直接访问'
      }, {
        value: 310,
        name: '邮件营销'
      }, {
        value: 234,
        name: '联盟广告'
      }, {
        value: 135,
        name: '视频广告'
      }, {
        value: 1548,
        name: '搜索引擎'
      }],
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  },

  // get_users
  module.exports.getUsers = {
    totalProperty: 846155,
    columns: [
      'UID', '头像', '用户名', '昵称', '备注', '勋章', '注册时间', '最近活跃时间', '注册渠道',
      '版本号', 'apptype', 'push', '性别', '用户等级', '手机号', '魅力值', '积分', '余额',
      '出生日期', '每分钟话费', '上传照片书'
    ],
    ops: {
      edits: ['修改信息', '充值', '赠送礼物', '增加'],
      delete: '删除',
    },
    users: [{
      "activetime": "2016-03-05 09:17:02",
      "apptype": 1,
      "balance": 380,
      "birth": "1985-02-05",
      "channel": "MyApp",
      "charming": 485,
      "createtime": "2016-03-05 09:13:17",
      "deleted": 0,
      "head": "",
      "mipush": 18,
      "nickname": "酒酒",
      "phone": "18276923508",
      "photo_count": 1,
      "price": 10,
      "score": 0,
      "sex": 1,
      "singertag": 0,
      "tag": "",
      "uid": 2860187,
      "username": "3CA895CB1A6A866A68A60601B0A6E3D9",
      "version": 123,
      "vip_flag": 0
    }, {
      "activetime": "2016-03-05 09:08:29",
      "apptype": 1,
      "balance": 430,
      "birth": "0000-00-00",
      "channel": "360",
      "charming": 355,
      "createtime": "2016-03-05 09:07:54",
      "deleted": 0,
      "head": "",
      "mipush": 18,
      "nickname": "xiaoyaolangzi",
      "phone": "18174331812",
      "photo_count": 1,
      "price": 10,
      "score": 10,
      "sex": 1,
      "singertag": 0,
      "tag": "",
      "uid": 2860186,
      "username": "881B45E9A48867F1FD287BE09C84DBBA",
      "version": 123,
      "vip_flag": 0
    }, ]
  }

module.exports.getReports = {
  total: 2,
  reports: [{
    uid: 100000,
    nickname: 'bad girl',
    report_count: 100,
    report_rate: '20%',
    images: [
      'http://pic.qqtn.com/up/2016-3/2016032110072330684.png',
      'http://pic.qqtn.com/up/2016-3/2016032110074892962.png',
      'http://pic.qqtn.com/up/2016-3/2016032110072398927.png',
      'http://pic.qqtn.com/up/2016-3/2016032110072445892.png',
      'http://pic.qqtn.com/up/2016-3/2016032110072479279.png',
      'http://pic.qqtn.com/up/2016-3/2016032110072469266.png',
      'http://pic.qqtn.com/up/2016-3/2016032110072425603.png',
      'http://pic.qqtn.com/up/2016-3/2016032110072488764.png',
    ],
  }, {
    uid: 100001,
    nickname: 'bad boy',
    report_count: 101,
    report_rate: '30%',
    images: [
      'http://pic.qqtn.com/up/2016-2/2016022809143728422.jpg',
      'http://pic.qqtn.com/up/2016-2/2016022809143758196.jpg',
      'http://pic.qqtn.com/up/2016-2/2016022809143780630.jpg',
      'http://pic.qqtn.com/up/2016-2/2016022809143767945.jpg',
      'http://pic.qqtn.com/up/2016-2/2016022809143760869.jpg',
      'http://pic.qqtn.com/up/2016-2/2016022809143748184.jpg',
      'http://pic.qqtn.com/up/2016-2/2016022809143741107.jpg',
      'http://pic.qqtn.com/up/2016-2/2016022809143721345.jpg',
    ],
  }, ]
}

module.exports.business = {
  getBusiness: [{
    sid: 101,
    sname: '粑粑来了',
    type: 1,
    goods: [{
      gid: 1,
      gname: '100元代金券',
      price: 88,
    },{
      gid: 2,
      gname: '200元代金券',
      price: 88,
    },]
  },{
    sid: 102,
    sname: '嘛嘛来了',
    type: 0,
    num: 2,
    goods: [{
      gid: 1,
      gname: '10元代金券',
      price: 8.8,
    },{
      gid: 2,
      gname: '20元代金券',
      price: 880,
    },{
      gid: 3,
      gname: '20元代金券',
      price: 880,
    }]
  },]
}
