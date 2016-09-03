/**
 * Created by lizongyuan on 16/4/20.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TagSchema = new Schema({
    tagName: String,
    postPath: String
});

var Tags = mongoose.model('tags', TagSchema);

module.exports = Tags;