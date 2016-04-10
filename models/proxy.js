var mongodb = require('./db');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

function Proxy(imgSourceUrl, imgTag){
    this.sourceUrl = imgSourceUrl;
    this.sourceTag = imgTag;
}

module.exports = Proxy;

//小爬虫
Proxy.prototype.startproxy = function(callback){
    var data = {
        url: this.sourceUrl,
        tag: this.sourceTag
    } ;
    request(data.url, function(err, res){
        if (err) {
            return callback(err);
        }
        var $ = cheerio.load(res.body.toString());
        var j = $('.j');
        var a = j.find('.a');
        var arr = a.find('img').toArray();
        for (var i = 0;i<arr.length;i++){
            var that = $(arr[i]);
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
            downloadImg(item.url, item.name);
            saveImg(img, callback);
        }
    });
};

//下载图片
function downloadImg(url ,name){
    request.head(url, function(err, res){
        if (err) {
            return callback(err);
        }
        var imgStorePath = 'public/avatar/' + name + '.jpg';
        fs.exists(imgStorePath, function(exits){
            if (exits) {
                console.log(name + '已存在!');
            } else {
                request(url).pipe(fs.createWriteStream(imgStorePath)).on('close', function(){
                    console.log(name + ' done');
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
                callback(null);
            });
        });
    });
}