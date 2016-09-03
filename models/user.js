/**
 * Created by lizongyuan on 16/3/12.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    text: String
});

var User = mongoose.model('users', UserSchema);

module.exports = User;

// var mongodb = require('./db');
//
// function User(user){
//     this.name = user.name;
//     this.email = user.email;
//     this.password = user.password;
//     this.text = user.text;
// }
//
// module.exports = User;
//
// User.prototype.save = function(callback){
//     var user = {
//         name: this.name,
//         email: this.email,
//         password: this.password
//     };
//     mongodb.open(function(err, db){
//         if (err){
//             return callback(err);
//         }
//         db.collection('users', function(err, collection){
//             if (err){
//                 mongodb.close();
//                 return callback(err);
//             }
//             collection.insert(user, {
//                 save: true
//             }, function(err, user){
//                 mongodb.close();
//                 if (err){
//                     return callback(err);
//                 }
//                 callback(null, user[0]);
//             });
//         });
//     });
// };
//
// User.get = function(name, callback){
//    mongodb.open(function(err, db){
//        if (err){
//            return callback(err);
//        }
//        db.collection('users', function(err, collection){
//            if (err){
//                mongodb.close();
//                return callback(err);
//            }
//            collection.findOne({
//                'name': name
//            }, function(err, user){
//                mongodb.close();
//                if (err){
//                    return callback(err);
//                }
//                callback(null, user);
//            });
//        });
//    });
// };
//
// User.update = function(name, newName, email, text, callback){
//     mongodb.open(function(err, db){
//         if (err){
//             return callback(err);
//         }
//         db.collection('users', function(err, collection){
//             if (err){
//                 mongodb.close();
//                 return callback(err);
//             }
//             collection.update({
//                 "name": name
//             }, {
//                 $set: {
//                     text: text,
//                     name: newName,
//                     email: email
//                 }
//             },function(err){
//                 mongodb.close();
//                 if (err){
//                     return callback(err);
//                 }
//                 callback(null);
//             });
//         });
//     });
// };