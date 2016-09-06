/**
 * Created by lizongyuan on 16/3/13.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new Schema({
    imagePath: 'String',
    userId: 'String',
    name: 'String',
    info: 'String',
    tag: []
});

var Image = mongoose.model('images', ImageSchema);

module.exports = Image;