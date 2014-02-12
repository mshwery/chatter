var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

app.set('views', __dirname + '/templates');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express); // 'splain this

app.get('/', function(req, res) {
  res.render('chat');
});

app.use(express.static(__dirname + '/public'));

//app.listen(port);
var io = require('socket.io').listen(app.listen(port));
console.log('Listening on port ' + port);

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
