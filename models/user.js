/**
 * Created by lizongyuan on 16/3/12.
 */
var mongodb = require('./db');

function User(user){
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
}

module.exports = User;

User.prototype.save = function(callback){
    var user = {
        name: this.name,
        email: this.email,
        password: this.password
    };
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('users', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(user, {
                save: true
            }, function(err, user){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null, user[0]);
            });
        });
    });
};

User.get = function(name, callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('users', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           collection.findOne({
               'name': name
           }, function(err, user){
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null, user);
           });
       });
   });
};