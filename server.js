/*jshint laxcomma:true*/

var http    = require('http')
  , express = require('express')
  , sockjs  = require('sockjs')
  , redis   = require('heroku-redis-client')
  , app     = express()
  , port    = process.env.PORT || 5000;

app.configure(function() {
  app.set('view engine', "jade");
  app.set('views', __dirname + '/templates');
  app.engine('jade', require('jade').__express); // 'splain this
  app.use(express.static(__dirname + '/public'));
});

// Redis pubsub
var publisher = redis.createClient();

// Sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockjs_chat = sockjs.createServer(sockjs_opts);
sockjs_chat.on('connection', function(conn) {
  var browser = redis.createClient();
  browser.subscribe('chat_channel');

  // When we see a message on chat_channel, send it to the browser
  browser.on("message", function(channel, message){
      conn.write(message);
  });

  // When we receive a message from browser, send it to be published
  conn.on('data', function(message) {
      publisher.publish('chat_channel', message);
  });
});

// Express server
var server = http.createServer(app);

sockjs_chat.installHandlers(server, {prefix:'/chat'});

console.log(' [*] Listening on port ' + port );
server.listen(port);

app.get('/', function(req, res) {
  res.render('chat');
});

// var io = require('socket.io').listen(app.listen(port));
// io.sockets.on('connection', function (socket) {

//   socket.emit('message', { message: 'welcome to the chat', timestamp: new Date().getTime() });

//   socket.on('send', function (data) {
//     data.timestamp = new Date().getTime();
//     io.sockets.emit('message', data);
//   });

//   socket.on('typing', function(data) {
//     io.sockets.emit('typing', data);
//   });

//   socket.on('stopped typing', function(data) {
//     io.sockets.emit('stopped typing', data);
//   });

// });
