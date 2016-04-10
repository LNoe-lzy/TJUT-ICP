/**
 * Created by lizongyuan on 16/3/13.
 */
var mongodb = require('./db');

function Images(imagePath, imageName, name, info, tag){
    this.imagePath = imagePath;
    this.imageName = imageName;
    this.name = name;
    this.info = info;
    this.tag = tag
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
        time: time,
        info: this.info,
        tag: this.tag
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
            }).toArray(function(err,img){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, img);
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
            }, function(err,image){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, image);
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

Images.update = function(name, imageName, info, tag, callback){
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "name": name,
                "imageName" :imageName
            }, {
                $set: {
                    info: info,
                    tag: tag
                }
            },function(err){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Images.search = function(keyword, callback){
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp("^.*" + keyword + ".*$", "i");
            collection.find({
                "info": pattern
            }, {
                "name": 1,
                "tag": 1,
                "imageName": 1,
                "imagePath": 1,
                "info": 1
            }).sort({
                time: -1
            }).toArray(function(err, imgs){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, imgs);
            });
        });
    });
};

Images.getByImageName = function(imageName, callback){
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "imageName": imageName
            },function(err, image){
                if (err){
                    mongodb.close();
                    return callback(err);
                }
                if (image) {
                    collection.find({
                        "tag": image.tag
                    }).sort({
                        time: -1
                    }).toArray(function(err, images){
                        mongodb.close();
                        if (err){
                            return callback(err);
                        }
                        callback(null, images)
                    });
                }
            });
        })
    });
};

Images.updateUserName = function(name, newName,callback){
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('images', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "name": name
            }, {
                $set: {
                    name: newName
                }
            },function(err){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};