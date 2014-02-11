var express = require('express');
var app = express();
var port = 3000;

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
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});