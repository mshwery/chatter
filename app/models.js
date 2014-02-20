/*jshint laxcomma:true*/

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
 
var ChatSchema = new Schema({
  username: String,
  message: String,
  created: { type: Date, default: Date.now }
});

var Chat = mongoose.model('Message', ChatSchema);

exports.getOldMsgs = function(limit, callback) {
  var query = Chat.find({});
  query.sort('-created').limit(limit).exec(function(err, docs) {
    callback(err, docs);
  });
};

exports.saveMsg = function(data, callback) {
  var newMsg = new Chat({
    username: data.username,
    message: data.message
  });
  newMsg.save(function(err) {
    callback(err);
  });
};