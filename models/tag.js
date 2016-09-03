/**
 * Created by lizongyuan on 16/4/20.
 */
var mongodb = require('./db');

function Tags(tagName, postPath){
    this.tagName = tagName;
    this.postPath = postPath;
}

module.exports = Tags;

Tags.prototype.save = function(){
   var tagName = this.tagName,
       postPath = this.postPath;
   mongodb.open(function(err, db){
       if (err) {
           console.log(err);
       }
       db.collection('tags', function(err, collections){
           if (err) {
               mongodb.close();
               console.log(err);
           }
           var query = {
              tagName: tagName,
               postPath: postPath
           };
           collections.update({
               tagName: tagName
           }, query,{
               upsert: true
           }, function(err){
               mongodb.close();
               if (err) {
                   console.log(err);
               }
           });
       });
   });
};

//获取全部tag
Tags.getAll = function(callback){
   mongodb.open(function(err, db){
      if (err) {
          return callback(err);
      }
       db.collection('tags', function(err, collections){
           if (err) {
               mongodb.close();
               return callback(err);
           }
           collections.find(null).toArray(function(err, tags){
               mongodb.close();
               if (err) {
                   return callback(err);
               }
               callback(null, tags);
           });
       });
   });
};