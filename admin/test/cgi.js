var express = require('express');
var agent = require('superagent');
var router = express.Router();
//var HOST = 'http://114.55.36.175/oss-bin/'
var HOST = 'http://120.76.236.185:8080/'

var testData = require('./testdata');


// post transformer
router.post('/*', function(req, res, next) {
    var action = req.params[0];
    if (action == 'get_edition') {
        next();
    } else {
        agent.post(HOST+action)
            .type('application/json')
            .send(req.body)
            .end(function(err, res1) {
                if (err || !res1.ok) {
                    var resp = makeResp(res1.status, 'error: '+res1.status, {});
                    res.jsonp(resp);
                } else {
                    res.send(res1.text);
                }
        });
    }
});

router.post('/get_edition',function(req,res,next){
    var getEdition = testData.getEdition;
    var resp = makeResp(0, 'OK', getEdition);
    res.jsonp(resp);
});

router.post('/post_edition', function(req, res, next) {

    var resp = makeResp(0, 'OK', getEdition);
    res.jsonp(resp);
});


/* GET users*/
//http://www.aini25.com/ncoss/cgi-bin/get_users?_dc=1457141828332&page=1&start=0&limit=30
router.get('/get_users', function(req, res, next) {
    var page = req.query.page;
    var start = req.query.start;
    var limit = req.query.limit;

    var getUsers = testData.getUsers;
    var resp = makeResp(0, 'OK', getUsers);
    console.log('page=%d start=%d limit=%d', page, start, limit);

    res.jsonp(resp);
});

router.get('/get_feedback', function(req, res, next) {
    var page  = req.query.page;
    var start = req.query.start;
    var limit = req.query.limit;

    var getFeedback = testData.getFeedback;
    var resp = makeResp(0, 'OK', getFeedback);
    console.log('page=%d start=%d limit=%d', page, start,limit);

    res.jsonp(resp);
})

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