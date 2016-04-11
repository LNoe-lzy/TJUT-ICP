var mongodb = require('./db');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');

function Proxy(imgSourceUrl, start, end, imgTag){
    this.sourceUrl = imgSourceUrl;
    this.start = start;
    this.end = end;
    this.sourceTag = imgTag;
}

module.exports = Proxy;

//小爬虫
Proxy.prototype.startproxy = function(callback){
    var data = {
        url: this.sourceUrl,
        start: this.start,
        end: this.end,
        tag: this.sourceTag
    } ;
    var urlList = [];
    for (var i = data.start; i <= data.end; i++) {
        var newUrl;
        if ( i == 1 ) {
            newUrl = data.url;
        } else {
            newUrl = data.url + '#!hot-p' + i;
        }
        urlList.push(newUrl);
    }
    async.eachSeries(urlList, function(is, callback){
        request(is, function(err, res){
            if (err) {
                return callback(err);
            }
            var $ = cheerio.load(res.body.toString());
            var j = $('.j');
            var a = j.find('.a');
            var arr = a.find('img').toArray();
            console.log('开始抓取页面:' + is);
            //采用async将下载img与存储img转为同步方法,解决异步方法下的读取数与保存数不一致bug
            async.eachSeries(arr, function(i, callback){
                var that = $(i);
                var item = {
                    info: that.attr('alt'),
                    url: that.attr('src'),
                    name: that.attr('data-rootid')
                };
                var imgLinkPath = '/avatar/' + item.name + '.jpg';
                var img = {
                    imagePath: imgLinkPath,
                    imageName: item.name,
                    name: 'admin',
                    info: item.info,
                    tag: data.tag
                };
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
    }, function(err){
        if (err) {
            console.log(err);
        }else{
            console.log('已完成全部抓取!');
        }
        callback();
    });
};

//下载图片
function downloadImg(url, img, name, callback){
    request.head(url, function(err, res){
        if (err) {
            return callback(err);
        }
        var imgStorePath = 'public/avatar/' + name + '.jpg';
        fs.exists(imgStorePath, function(exits){
            if (exits) {
                console.log(name + '已存在!');
                return callback();
            } else {
                request(url).pipe(fs.createWriteStream(imgStorePath)).on('close', function(){
                    console.log(name + ' 已获取完毕!');
                    saveImg(img, callback);
                });
            }
        });
    });
}

function saveImg(img,callback){
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('images',function(err, collections){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collections.update(img, img ,{
                upsert: true
            },function(err){
                mongodb.close();
                if (err){
                    return callback;
                }
                console.log(img.imageName + '已存储完毕!');
                callback(null);
            });
        });
    });
}