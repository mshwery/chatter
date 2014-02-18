/*jshint laxcomma:true*/

/**
 * Module dependencies.
 */

var http = require('http')
  , express = require('express')
  , fs = require('fs')
  , port = process.env.PORT || 5000
  , chatServer = require('./config/chat-server')
  , env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env];

var app = express();

// express settings
require('./config/express')(app, config);

// Express server
var server = http.createServer(app).listen(port);
chatServer.listen(server);
console.log('Express app started on port '+port);

app.get('/', function(req, res) {
  res.render('chat');
});
