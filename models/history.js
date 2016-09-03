/**
 * Created by lizongyuan on 16/4/19.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HistorySchema = new Schema({
    userId: String,
    imageId: String
});

var History = mongoose.model('historys', HistorySchema);

module.exports = History;
