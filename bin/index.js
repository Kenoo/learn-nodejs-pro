var R_fs = require('fs');
var find_scope = require('./find');

var ori_list =  R_fs.readFileSync("../test/origin.txt").toString().trim().split(/\n/mg);

var ori_list_text = find_scope.find_cn('../test/origin.txt');//已经过滤掉html
var ori_list_without_same = find_scope.find_cn('../test/origin.txt', true); //去掉重复的中文。
var to_translate_list = [];

for (var i =0; i<ori_list.length; i++) { //试着还原匹配
    if (ori_list[i].indexOf(ori_list_text[i]) === -1) { //翻译没有完全匹配的
        try{
            var matchReg = new RegExp(
                ori_list_text[i].
                replace(/^[^\u4e00-\u9fa5]*/, ''). //首尾去掉非中文字符
                replace(/[^\u4e00-\u9fa5]*$/, '').
                replace(/(^.{2}).*(.{2}$)/g, '[$1]\.*[$2]')
            ); //首尾2个字符匹配法则。
    
            var matches = ori_list[i].match(matchReg);
            
            if (matches && matches.length > 0 && ori_list[i].indexOf(matches[0]) > -1) {
                to_translate_list.push(matches[0]);
            } else {
                console.log('~~~~~~~匹配出错~~~~~~');
            }
        } catch (e) {
            to_translate_list.push(ori_list[i]);
            console.log(e.message);
        }
    } else {
        to_translate_list.push(ori_list_text[i]);
    }
}

//to_translate_list = ori_list_without_same.concat(to_translate_list);

var to_translate_list = new Set(to_translate_list),
    newArry = [];

to_translate_list.forEach(function (v) {
    newArry.push(v);
});

R_fs.writeFileSync("../test/to_translate_list.txt", newArry.join('\n'));


