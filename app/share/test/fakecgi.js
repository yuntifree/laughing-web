var express = require('express');
var agent = require('superagent');
var router = express.Router();
var HOST = 'http://120.76.236.185/'

// test data
var prices = [{
        price: 6,
        coin: 60
    },{
        price:30,
        coin: 300
    },{
        price: 100,
        coin: 1000,
        free: 50
    },{
        price: 200,
        coin: 2000,
        free: 150
    }
];

var userInfo = {
    uid: 100004,
    name: '阿敏敏',
    head: 'http://pic.qqtn.com/up/2016-3/2016030817572236055.jpg'
}

// post transformer
router.post('/*', function(req, res, next) {
    var action = req.params[0];
    agent.post(HOST+action)
        .type('application/json')
        .send(req.body)
        .end(function(err, res1) {
            if (err || !res1.ok) {
                var resp = makeResp(res1.status, 'error: '+res1.status, {});
                res.jsonp(resp);
                console.log(resp);
            } else {
                res.send(res1.text);
            }
        });
});

/* GET users*/
//http://www.aini25.com/ncoss/cgi-bin/get_users?_dc=1457141828332&page=1&start=0&limit=30
router.get('/get_prices', function(req, res, next) {
    var data = {prices: prices}
    var resp = makeResp(0, 'OK', data);
    res.jsonp(resp);
});

router.get('/get_userinfo', function(req, res, next) {
    var uid = req.query.uid;
    uid = ~~uid;
    if (uid !== 0) {
        userInfo.uid = uid;
    }
    var resp = makeResp(0, 'OK', userInfo);
    res.jsonp(resp);
});

function makeResp(errno, desc, data) {
    return {
        errno: errno,
        desc: desc,
        data: data
    }
}

module.exports = router;