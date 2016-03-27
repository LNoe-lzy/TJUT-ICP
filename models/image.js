/**
 * Created by lizongyuan on 16/3/13.
 */
var mongodb = require('./db');

function Images(imagePath, imageName, name){
    this.imagePath = imagePath;
    this.imageName = imageName;
    this.name = name;
}

module.exports = Images;


Images.prototype.save = function(callback){
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    var img = {
        imagePath: this.imagePath,
        imageName: this.imageName,
        name: this.name,
        time: time
    };
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(img, {
                safe: true
            }, function(err){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Images.getAll = function(name, callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name){
                query.name = name;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function(err,paths){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, paths);
            });
        });
    });
};

Images.getOne = function(imageName, callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                'imageName': imageName
            }, function(err,paths){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, paths);
            });
        });
    });
};

Images.remove = function(name, imageName, callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('images', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           collection.remove({
               "name": name,
               "imageName": imageName
           }, function(err){
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null);
           });
       });
   });
};

Images.getTags = function(tagName, callback){
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.find({
                "tag": tagName
            }).sort({
                time: -1
            }).toArray(function(err, tags){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, tags);
            });
        });
    });
};

//Images.search = function(keyword, callback){
//    mongodb.open(function(err, db){
//        if (err){
//            return callback(err);
//        }
//        db.collection('images', function(err, collection){
//            if (err){
//                mongodb.close();
//                return callback(err);
//            }
//            var pattern = new RegExp("^.*" + keyword + ".*$", "i");
//            collection.find({
//                "title": pattern
//            }, {
//                "name": 1,
//                "time": 1,
//                "title": 1
//            }).sort({
//                time: -1
//            }).toArray(function(err, docs){
//                mongodb.close();
//                if (err){
//                    return callback(err);
//                }
//                callback(null, docs);
//            });
//        });
//    });
//};