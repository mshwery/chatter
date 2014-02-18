/*jshint laxcomma:true*/

var sockjs = require('sockjs')
    , redis = require('heroku-redis-client') // Redis pubsub using heroku wrapper
    , db = require('./chat-db');

exports.listen = function(server) {
  var publisher = redis.createClient();

  // Sockjs server
  var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
  var sockjs_chat = sockjs.createServer(sockjs_opts);
  sockjs_chat.installHandlers(server, { prefix:'/chat' });

  sockjs_chat.on('connection', function(socket) {
    var browser = redis.createClient();
    browser.subscribe('chat');
    browser._username = '';

    initializeConnection(socket);
    handleMessageBroadcast(browser, socket);
    handleMessageReceipt(socket, publisher, browser);
  });
};

function initializeConnection(socket) {

}

function handleMessageBroadcast(browser, socket) {
  // When we see a message on chat_channel, send it to the browser
  browser.on("message", function(channel, message){
    var data = JSON.parse(message);
    data.data["username"] = browser._username; // send with username
    socket.write(JSON.stringify(data));
  });
}

function handleMessageReceipt(socket, publisher, browser) {
  socket.on('data', function(message) {
    var data = JSON.parse(message);
    
    if (data.name == 'join') {
      browser._username = data.data.username; // set the user
    }

    console.log(data);
    publisher.publish('chat', JSON.stringify(data));
  });
}