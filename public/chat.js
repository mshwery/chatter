/*jshint laxcomma:true*/

(function() {

  var imageUrlRegex = /(https?:\/\/.*\.(?:png|jpe?g|gif))/i;

  function urlToImage(text) {
    return text.replace(imageUrlRegex,"<a class='img' href='$1' target='_blank'><img src='$1'/></a>");
  }

  $.fn.makeImages = function() {
    var textNodes = this.contents().filter(function () { return this.nodeType === 3; });
    textNodes.each(function() {
      $(this).replaceWith( urlToImage( this.textContent ) );
    });
    return this;
  };

})();

var $messages = $("#messages");

function printLine (message){
  $messages.append( $("<li/>").append( $("<code>").text(message) ).append("<br>") );
  $messages.scrollTop($messages.scrollTop()+10000);
}

function socketChatRoom(username) {
  var sckt = new socket('chat');

  sckt.on('connect', function() {
    printLine('Connected');
    sckt.emit('join', {
      username: username
    });
  });

  // Start socket instance
  sckt.connect();

  return sckt;
}

function setupChatRoom() {
  var username = $("#username").val();

  if (username.length) {

    var sckt = socketChatRoom(username);

    $("#new-user").remove();

    var messages      = []
        , users       = {}
        , typers      = {};

    // elements
    var $newMessage = $('.new-message')
        , $userList = $("#user-list");

    var addMessage = function (data) {
      if (data) {
        messages.push(data.message);
        var klasses = ['user'];

        klasses.push( ( (username == data.username) ? 'you' : '' ) );

        var $date = $("<span/>").addClass('timestamp').text( moment(data.timestamp).format('MMM D YYYY, h:mm:ss a') ),
            $user = $("<span/>").addClass(klasses.join(' ')).text( ' <' + (data.username || 'Server') + '> ' ),
            $text = $("<span/>").text(data.message).makeImages().linkify(),
            $html = $("<li/>").append($date).append($user).append($text);
        $messages.append($html);
      } else {
        console.log('Nope: ', data);
      }
    };

    var sendMessage = function () {
      var text = $newMessage.val();
      if (text) {
        sckt.emit("chat", {
          message: text
        });
        $newMessage[0].value = '';
        //isTyping(false);
      }
    };

    sckt.on('chat', addMessage);

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
        //if (typing != newValue) isTyping(newValue);
      })
      .focus();

    $('form').on('submit', function(e) {
      e.preventDefault();
    });

  }
}

$(document).ready(function() {

  var $userForm = $("#new-user");

  $userForm.on('submit', function(e) {
    setupChatRoom();
    e.preventDefault();
  });
  $userForm.find('input').on('keypress', function(e) {
    if (e.keyCode == 13) {
      setupChatRoom();
      e.preventDefault();
    }
  });

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

});
