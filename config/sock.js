/*jshint laxcomma:true*/

var sockjs = require('sockjs')
    , redis = require('heroku-redis-client'); // Redis pubsub using heroku wrapper

module.exports = function (app, config) {

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

  sockjs_chat.installHandlers(app, { prefix:'/chat' });

};