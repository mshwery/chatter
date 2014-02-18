var mongoose = require('mongoose');

// db initialization
var db = mongoose.connect('mongodb://localhost/chat', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to mongodb");
  }
});

// Bootstrap models
require('../app/models');