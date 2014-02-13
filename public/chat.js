/*jshint laxcomma:true*/

(function() {

  function urlsToHtml(text) {
      var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      return text.replace(exp,"<a href='$1' target='_blank'>$1</a>");
  }

  $.fn.linkify = function() {
    var text = urlsToHtml(this.text());
    this.html(text);
    return this;
  };

})();

$(document).ready(function() {

  var messages      = []
      , users       = {}
      , typers      = {}
      , sockjs_url  = '/chat'
      , sockjs      = new SockJS(sockjs_url)
      , user        = 'guest ' + new Date().getSeconds();

  // elements
  var $newMessage = $('.new-message')
      , $messages = $("#messages")
      , $userList = $("#user-list")
      , div       = $("#pings");

  var print = function(message){
    div.append($("<code>").text(message));
    div.append($("<br>"));
    div.scrollTop(div.scrollTop()+10000);
  };

  sockjs.onopen = function() {
    print('Connected');
  };
  sockjs.onmessage = function(e) {
    var data = JSON.parse(e.data);
    if (data.message) {
      addMessage(data.message);
    } else {
      print(data);
    }
    console.log(data);
  };
  sockjs.onclose = function() {
    print('Closing connection.');
  };

  function addUser(data) {
    if (data) {
      users[data.client] = $('<li/>').text(data.client).appendTo($userList);
    }
  }

  function removeUser(data) {
    if (users[data.client]) users[data.client].remove();
  }

  function addTyper(data) {
    if (data && !typers[data.username]) {
      typers[data.username] = $('<span/>').text(data.username + ' is typing...').appendTo('#content');
    }
  }

  function removeTyper(data) {
    if (data) {
      console.log(data);
      if (typers[data.username]) typers[data.username].remove();
      delete typers[data.username];
    }
  }

  function addMessage(data) {
    if (data) {
      messages.push(data.message);
      var klasses = ['user'];

      klasses.push( (!data.user ? 'log' : ( (user == data.user) ? 'you' : '' )) );

      var username = $("<span/>").addClass(klasses.join(' ')).text( '[' + moment(data.timestamp).format('h:mm:ss a') + '] ' + (data.user || 'Server') + ': ' ),
          text = $("<span/>").text(data.message).linkify(),
          html = $("<li/>").append(username).append(text);
      $messages.append(html);
    } else {
      console.log('Nope: ', data);
    }
  }

  function sendMessage() {
    var text = $newMessage.val();
    if (text) {
      sockjs.send(JSON.stringify({
        message: {
          user: user,
          message: text
        }
      }));
      $newMessage[0].value = '';
      isTyping(false);
    }
  }

  // set up channel subscriptions
  // socket.on("typing", addTyper);
  // socket.on("stopped typing", removeTyper);
  // socket.on("connected", addUser);
  // socket.on("disconnected", removeUser);

  // handle if the user is typing or not
  var typingTimeout = null,
      typing = false;

  function isTyping(newValue) {
    typing = !!newValue;

    if (newValue) {
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(isTyping, 5000);
      //socket.emit('typing', { username: user });
    } else {
      //socket.emit('stopped typing', { username: user });
    }
  }

  // bind enter key, and isTyping publisher
  $newMessage
    .on('keypress', function(e) {
      if ( e.keyCode == 13 ) {
        sendMessage();
        e.preventDefault();
      }
    })
    .on('keyup', function(e) {
      var newValue = !!this.value.length;
      if (typing != newValue) isTyping(newValue);
    })
    .focus();

  $('form').on('submit', function(e) {
    e.preventDefault();
  });

  // socket.onmessage = function (event) {
  //   console.log(event);
  //   var data = JSON.parse(event.data);
  //   if (data.message) {
  //     addMessage(data.message);
  //   }
  // };

});
