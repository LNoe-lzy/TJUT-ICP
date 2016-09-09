var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');

var Tags = require('./tag');
var Images = require('./image');

function Proxy(imgSourceUrl){
    this.sourceUrl = imgSourceUrl;
}

module.exports = Proxy;

//小爬虫
Proxy.prototype.startproxy = function(callback){
    var data = {
        url: this.sourceUrl
    } ;
    request(data.url, function(err, res){
        if (err) {
            return callback(err);
        }
        var $ = cheerio.load(res.body.toString());
        var navRight= $('#dt-nav-right-inner');
        var navGroup = navRight.find('.dt-nav-group');
        var navA = navGroup.find('a').toArray();
        async.eachSeries(navA, function(elem, callback){
            var ehref = $(elem).attr('href');
            var thref = 'http://www.duitang.com' + ehref;
            var tag = elem.children[0].data;
            requestUrl(thref, [tag], callback);
        }, function(err){
            if (err) {
                console.log(err);
            } else {
                console.log('获取完毕!');
            }
        });
    });
};

//下载图片
function downloadImg(url, img, name, callback){
    request.head(url, function(err, res){
        if (err) {
            return callback(err);
        }
        var imgStorePath = 'public/avatar/proxy/' + name + '.jpg';
        fs.exists(imgStorePath, function(exits){
            if (exits) {
                console.log(name + '已存在!');
                return callback();
            } else {
                request(url).pipe(fs.createWriteStream(imgStorePath)).on('close', function(){
                    console.log(name + ' 已获取完毕!');
                    saveImg(img, callback);
                }).on('error', function (err) {
                    callback(err);
                });
            }
        });
    });
}

//存储图片到数据库
function saveImg(img, callback){
    Images.update(img, null, {
        upsert: true
    }, function (err) {
        if (err) {
            console.log(err);
        }
        console.log(img.imageName + '已存储完毕!');
        callback(null);
    });
}

//request页面
function requestUrl(url, tag, callback){
    request(url, function(err, res){
        if (err) {
            return callback(err);
        }
        var $ = cheerio.load(res.body.toString());
        var j = $('.j');
        var a = j.find('.a');
        var arr = a.find('img').toArray();
        console.log('开始抓取页面:' + url);
        //采用async将下载img与存储img转为同步方法,解决异步方法下的读取数与保存数不一致bug
        async.eachSeries(arr, function(i, callback){
            var date = new Date();
            var time = {
                date: date,
                year: date.getFullYear(),
                month: date.getFullYear() + "-" + (date.getMonth() + 1),
                day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
            };
            var that = $(i);
            var item = {
                info: that.attr('alt'),
                url: that.attr('src'),
                name: that.attr('data-rootid')
            };
            var imgLinkPath = '/avatar/proxy/' + item.name + '.jpg';
            var img = {
                imagePath: imgLinkPath,
                name: 'admin',
                time: time,
                info: item.info,
                tag: tag
            };
            //存储标签信息以及海报信息
            var newTag = new Tags({
                tagName:tag[0],
                postPath: imgLinkPath
            });
            newTag.save();
            console.log(item.name + '开始获取!');
            downloadImg(item.url, img, item.name, callback);
        }, function(err){
            if (err) {
                console.log(err);
            } else {
                console.log('当前页面抓取完成!');
            }
            callback();
        });
    });
}