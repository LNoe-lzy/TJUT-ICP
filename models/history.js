/**
 * Created by lizongyuan on 16/4/19.
 */
var mongodb = require('./db');
var async = require('async');

function History(name, image){
    this.name = name;
    this.image = image;
}
module.exports = History;

History.prototype.save = function(callback){
    var name = this.name,
        image = this.image;
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('historys', function(err, collections){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {
                historyUser: name,
                imagePath: image.imagePath,
                imageName: image.imageName,
                name: image.name,
                info: image.info,
                tag: image.tag
            };
            collections.update(query, query, {
                upsert: true
            }, function(err){
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })
        });
    });
};

History.getAll = function(name, callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('historys', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name){
                query.historyUser = name;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function(err,his){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, his);
            });
        });
    });
};

History.count = function(name, tag, callback){
    mongodb.open(function(err, db){
        if (err) {
            return callback(err);
        }
        db.collection('historys', function(err, collections){
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collections.count({
                historyUser: name,
                tag: tag
            }, function(err, total){
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, total);
            });
        });
    });
};

//找到数据库部分历史数据并返回标签
History.getPart = function(name, callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('historys', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name){
                query.historyUser = name;
            }
            collection.find(query,{
                "tag": 1
            }).sort({
                time: -1
            }).toArray(function(err,tag){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                var tags = [];
                tag.forEach(function(elem){
                    var tmp = elem.tag[0];
                    tags.push(tmp)
                });
                var u_tags = unique(tags);
                callback(null, u_tags);
            });
        });
    });
};

//删除一个数组中重复的值
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}
