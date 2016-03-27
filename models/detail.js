/**
 * Created by lizongyuan on 16/3/13.
 */
var mongodb = require('./db');

function Detail(name, imageName, info, tag){
    this.name = name;
    this.imageName = imageName;
    this.info = info;
    this.tag = tag;
}

module.exports = Detail;

Detail.update = function(name, imageName, info, tag, callback){
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
