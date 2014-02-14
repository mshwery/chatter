/*jshint laxcomma:true*/

/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV || 'development'
  , app = express()
  , config = require('./config/config')[env]
  , mongoose = require('mongoose');

// express settings
require('./config/express')(app, config);

// db initialization
var db = mongoose.connect('mongodb://localhost/chat', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to mongodb");
  }
});

// Bootstrap models
require('./app/models');

// Express server
var port = process.env.PORT || 5000,
    http = require('http'),
    server = http.createServer(app);

// Sockjs websockets config
require('./config/sock')(server, config);

server.listen(port);
console.log('Express app started on port '+port);

app.get('/', function(req, res) {
  res.render('chat');
});
