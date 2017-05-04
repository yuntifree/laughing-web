var fs = require('fs');
var xlsx = require('node-xlsx');
var inputFile, outputFile;

var arglist = process.argv;

if (arglist.length < 4) {
    console.log('Usage:\nnode export2xlsx.js [input].json [output].xlsx');
    return;
}

inputFile = arglist[2];
outputFile = arglist[3];

/**
 * {
 *     columns:[],
 *     rows:[],
 * }
 */
var testData = {
    columns: [
        'UID','头像','用户名','昵称','备注','注册时间','最近活跃时间','手机号'
    ],
    rows: [
    [
        2860187,
        "",
        "3CA895CB1A6A866A68A60601B0A6E3D9",
        "酒酒",
        "",
        "2016-03-05 09:17:02",
        "2016-03-05 09:13:17",
        "18276923508",
    ]
    ]
}

var data = [];
data.push(testData.columns);
data = data.concat(testData.rows);

var buffer = xlsx.build([{name: "Sheet1", data: data}]);
fs.writeFileSync(outputFile, buffer, 'binary');