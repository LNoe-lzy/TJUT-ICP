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
