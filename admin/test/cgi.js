var express = require('express');
var agent = require('superagent');
var router = express.Router();
//var HOST = 'http://120.76.236.185:8081/'
var HOST = 'http://devop.laughingus.com/'

var testData = require('./testdata');


// post transformer
router.post('/*', function(req, res, next) {
    var action = req.params[0];
    if (action == 'upload_img') {
        agent.post(HOST+action)
            .send(req.body)
            .end(function(err, res1) {
                if (err || !res1.ok) {
                    if (res1) {
                        var resp = makeResp(res1.status, 'error: '+res1.status, {});
                        res.jsonp(resp);
                    } else {
                        console.log(err)
                    }
                } else {
                    res.send(res1.text);
                }
        });
    } else {
        agent.post(HOST+action)
            .type('application/json')
            .send(req.body)
            .end(function(err, res1) {
                if (err || !res1.ok) {
                    if (res1) {
                        var resp = makeResp(res1.status, 'error: '+res1.status, {});
                        res.jsonp(resp);
                    } else {
                        console.log(err)
                    }
                } else {
                    res.send(res1.text);
                }
        });
    }
});


/* GET users*/
//http://www.aini25.com/ncoss/cgi-bin/get_users?_dc=1457141828332&page=1&start=0&limit=30

router.get('/get_bars', function(req, res, next) {
    var getBars = testData.getBars;
    var resp = makeResp(0, 'OK', getBars);

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