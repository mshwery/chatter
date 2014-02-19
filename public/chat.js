/*jshint laxcomma:true*/

var $messages = $("#messages");

function printLine (message){
  $messages.append( $("<li/>").append( $("<code>").text(message) ).append("<br>") );
  $messages.scrollTop($messages.scrollTop()+10000);
}

function handleUserName(err) {
  if (err) {
    alert(err);
  } else {
    $("#new-user").remove();
  }
}

function socketChatRoom() {
  var sock = new SockJS('/chat');
  var chuckt = epixa.chucktify(sock);

  return chuckt;
}

function setupChatRoom(username) {

  if (username.length) {

    var sock = socketChatRoom();
    sock.on('joined', function(data) {
      printLine(data);
      sock.emit('choose-name', username, handleUserName);
    });

    // elements
    var $newMessage = $('.new-message')
        , $userList = $("#user-list")
        , lastMessage;

    var addMessage = function (data) {
      console.log(data);
      if (data) {
        var klasses = ['username'];

        if (username == data.username) {
          klasses.push('you');
        }

        var $date = $("<span/>").addClass('timestamp').text( moment(data.timestamp).format('h:mm a') ),
            $user = $("<span/>").addClass(klasses.join(' ')).text( ' ' + data.username + ' ' ),
            $text = $("<span/>").addClass('message-content').text(data.message).makeImages().linkify(),
            $html = $("<div/>").addClass('message');
        
        // append message content only if last user is same as this message's user
        // and its within a reasonable time since previous comment?
        if ( lastMessage && lastMessage.username == data.username && moment(lastMessage.timestamp).add('minutes', 1) > moment(data.timestamp) ) {
          $messages.append( $html.append($text) );
        } else {
          $messages.append( $html.append($user).append($date).append($text) );
        }
        // set last user
        lastMessage = data;

      } else {
        console.log('Nope: ', data);
      }
    };

    var sendMessage = function () {
      var text = $newMessage.val();
      if (text) {
        sock.emit("chat-message", text);
        $newMessage[0].value = '';
        //isTyping(false);
      }
    };

    sock.on('chat-message', addMessage);

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

  $("#new-user").on('submit', function(e) {
    e.preventDefault();
    var username = $("#username").val();
    setupChatRoom(username);
  });

});
