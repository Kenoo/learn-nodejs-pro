/**
 * @auth czt
 */

var R_fs = require('fs');
var find_scope = require('./find');

var translate_list = R_fs.readFileSync("../test/translate.txt").toString().trim().split(/\n/mg);
var untranslate_list = R_fs.readFileSync("../test/un_translate.txt").toString().trim().split(/\n/mg);
var new_list = R_fs.readFileSync("../test/origin.txt").toString().trim().split(/\n/mg);

//返回没有去重的中文数组
var ori_list = find_scope.find_cn("../test/origin.txt");

//将去重翻译好的文件转成  key:value (key为中文)
var map_list = {};

//未匹配列表
var un_match_list = [], un_match_ori_list = [];

if (translate_list.length === untranslate_list.length) {
    for (var i=0; i<translate_list.length;i++) {
        map_list[untranslate_list[i]] = translate_list[i];
    }
}
var removed_list = [];

function  completeReplace(text, chn, en) {
    return text.replace(new RegExp(chn, 'g'), en);
}

console.log('##############翻译还原异常###############');
for (var j =0; j<ori_list.length; j++) {
    if (map_list[ori_list[j]]) {
        if (find_scope.is_chinese(map_list[ori_list[j]])) {//还没有翻译部分
            removed_list.push(map_list[ori_list[j]]);
        }
        
        if (new_list[j].indexOf(ori_list[j]) > -1) { //翻译有 完全匹配的
            new_list[j] = completeReplace(new_list[j], ori_list[j],  map_list[ori_list[j]])
        } else {
            //不完全匹配，则说明提取的时候，文件提取可能不正确。或者1行有多个中文（已经用 ##合并的）。
            var m_c = ori_list[j].split(/##/g), m_c_en = map_list[ori_list[j]].split(/##/g) ;
            if (m_c.length > 1) {
                var mid_text = new_list[j];
                for (var l = 0; l < m_c.length; l++) {
                    if (new_list[j].indexOf(m_c[l]) > -1) { //每个进行匹配，如果有1个匹配不中，则还原。
                        mid_text = completeReplace(mid_text, m_c[l],  m_c_en[l].trim());
                    } else {
                        mid_text = new_list[j];
                        break;
                    }
                }
                new_list[j] = mid_text;
            } else {
                //未匹配到
                un_match_list.push(j+1 + ':' + ori_list[j]);
                un_match_ori_list.push(j+1 + ':' + new_list[j]);
            }
            
        }
    } else {//行数异常
        console.log('##############行数异常###############');
    }
}

//打印出未翻译部门

console.log('##############未翻译部分###############');
console.log(removed_list.filter(function (item) {
    if (item.indexOf('removed') > -1 || item.indexOf('不翻译') > -1) {
        return false;
    }
    return true;
}));

console.log('##############异常匹配部分###############');
R_fs.writeFileSync("../test/new_list.txt", new_list.join('\n'));
R_fs.writeFileSync("../test/un_match_list.txt", un_match_list.join('\n'));
R_fs.writeFileSync("../test/un_match_ori_list.txt", un_match_ori_list.join('\n'));