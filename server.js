/*jshint laxcomma:true*/

var express = require('express')
  , io = require('socket.io')
  , app = express()
  , port = process.env.PORT || 5000;

app.configure(function() {
  app.set('view engine', "jade");
  app.set('views', __dirname + '/templates');
  app.engine('jade', require('jade').__express); // 'splain this
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
  res.render('chat');
});

console.log('Listening on port ' + port);

var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {

  socket.emit('message', { message: 'welcome to the chat', timestamp: new Date().getTime() });

  socket.on('send', function (data) {
    data.timestamp = new Date().getTime();
    io.sockets.emit('message', data);
  });

  socket.on('typing', function(data) {
    io.sockets.emit('typing', data);
  });

  socket.on('stopped typing', function(data) {
    io.sockets.emit('stopped typing', data);
  });

});
