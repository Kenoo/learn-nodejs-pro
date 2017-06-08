/**
 * @auth czt
 */
var cheerio = require('cheerio');
var R_fs = require('fs');

var numReg = /:(\d+)?:/;//去掉前面的 文件路径 + 行号
var sreg = (/(["|'])(.+?)\1/g);

function isChiness (text) {
    return /[\u4e00-\u9fa5]/.test(text);
}

function recursion (text) {
    var mid, midAry = [];
    while (mid = sreg.exec(text)) {
        if (isChiness(mid[2])) {
            midAry.push(mid[2]);
        }
    }
    if (midAry && midAry.length > 0) {
        return midAry.join('##');
    }
    return text;
}

/**
 * 返回一个数组。
 * @param {Sring}file 文件相对路径
 * @param {Boolean}dereplication 是否去重
 * @return {Array}
 */
var find_cn = function (file, dereplication) {
    var cnList = [];
    var code = R_fs.readFileSync(file).toString().trim().split(/\n/mg);
    var data;
    
    for (var i = 0; i < code.length; i++) {
        $ = cheerio.load(code[i]);
        var ary = code[i].split(numReg);
        var html = ary[2];
        var loader = $.load(ary[2]);
        var text = loader.text().replace(/^[\t|\s]+|[\t|\s]+$/g, '');
        var matches = [];
        
        if (!isChiness(text)) {
            matches = html.match(/title\s*=\s*(['|"])(.+?)\1/);
            text = matches && matches[2] || "-";
        }
    
        if (!isChiness(text)) {
            matches = html.match(/value\s*=\s*(['|"])(.+?)\1/);
            text = matches && matches[2] || "-";
        }
             
        if (!isChiness(text)) {
            matches = html.match(/label\s*=\s*(['|"])(.+?)\1/);
            text = matches && matches[2] || "-";
        }
        cnList.push({
            url: ary[0],
            line: i,
            num: ary[1],
            html: html,
            text: text
        });
    }
    
    data = cnList.map(function (item) {
        var text = recursion(item.text);
        text = recursion(text);
        return text;
        
    });
    
    if (dereplication === true) {
        var setData = new Set(data),
            newArry = [];
    
        setData.forEach(function (v) {
            newArry.push(v);
        });
        return newArry;
    }
    
    return data
};

module.exports = {
    find_cn :find_cn,
    is_chinese : isChiness
};