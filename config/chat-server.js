/*jshint laxcomma:true*/

var sockjs = require('sockjs')
    , redis = require('heroku-redis-client') // Redis pubsub using heroku wrapper
    , chuckt = require('./chuckt_redis')
    , db = require('./chat-db');

// object to store usernames
var usernames = {},
    namesUsed = [];

exports.listen = function(server) {

  // To set a global reference to all clients
  var connections={};

  // A global reference to the redis publisher
  var publisher = redis.createClient();

  // Sockjs server
  var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
  var sock = sockjs.createServer(sockjs_opts);
  sock.installHandlers(server, { prefix:'/chat' });

  sock.on('connection', function(conn) {
    var socket = new ChuckT(conn, connections, publisher);

    initializeConnection(socket);
    handleMessageBroadcasting(socket);
    handleChoosingNicknames(socket);
    handleClientDisconnections(conn); // chuckt doesn't surface the disconnect
  });
};


function initializeConnection(socket) {
  socket.emitToBrowser('joined', 'Connected');
}

function handleMessageBroadcasting(socket) {
  socket.on('chat-message', function(msg) {
    console.log(msg);
    var username = usernames[socket.id];
    socket.emitToAllBrowsers('chat-message', { username: username, message: msg, timestamp: Date.now() });
  });
}

function handleChoosingNicknames(socket) {
  socket.on('choose-name', function(name, callback) {
    if (namesUsed.indexOf(name) !== -1) {
      callback('That name is already taken!  Please choose another one.');
      return socket.conn.close();
    }
    var ind = namesUsed.push(name) - 1;
    usernames[socket.id] = name;
    callback(null);
    socket.emitToAllBrowsers('new user', {id: ind, username: name});
  });
}

function handleClientDisconnections(socket) {
  socket.on('close', function() {
    var ind = namesUsed.indexOf(usernames[socket.id]);
    delete namesUsed[ind];
    console.log('%s disconnected', ind);
  });
}