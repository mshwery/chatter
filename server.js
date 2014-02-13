/*jshint laxcomma:true*/

var http    = require('http')
  , express = require('express')
  , sockjs  = require('sockjs')
  , redis   = require('heroku-redis-client') // thin wrapper around redistogo
  , app     = express()
  , port    = process.env.PORT || 5000;

app.configure(function() {
  app.set('view engine', "jade");
  app.set('views', __dirname + '/templates');
  app.engine('jade', require('jade').__express); // 'splain this?
  app.use(express.static(__dirname + '/public'));
});

// Redis pubsub
var publisher = redis.createClient();

// Sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockjs_chat = sockjs.createServer(sockjs_opts);
sockjs_chat.on('connection', function(conn) {
  var browser = redis.createClient();
  browser.subscribe('chat');
  browser._username = '';

  // When we see a message on chat_channel, send it to the browser
  browser.on("message", function(channel, message){
    var data = JSON.parse(message);
    data.data["username"] = browser._username; // send with username
    conn.write(JSON.stringify(data));
  });

  // When we receive a message from browser, send it to be published
  conn.on('data', function(message) {

    var data = JSON.parse(message);
    if (data.name == 'join') {
      browser._username = data.data.username; // set the user
    }

    console.log(data);
    publisher.publish('chat', JSON.stringify(data));
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
