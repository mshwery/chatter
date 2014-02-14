/*jshint laxcomma:true*/

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
 
var ChatMessageSchema = new Schema({
  username: String,
  message: String,
  created_at: { type: Date, default: Date.now }
});

mongoose.model('Message', ChatMessageSchema);