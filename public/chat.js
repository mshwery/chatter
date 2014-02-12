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

  var messages = [],
      socket = io.connect('/'),
      user = 'Fedmate ' + parseInt(Math.random() * 1000, 10);

  // dom els
  var $newMessage = $('.new-message'),
      $messages = $("#messages");

  function addMessage(data) {
    if (data) {
      messages.push(data.message);
      var klasses = ['user'];

      klasses.push( (!data.username ? 'log' : ( (user == data.username) ? 'you' : '' )) );

      var username = $("<span/>").addClass(klasses.join(' ')).text( '[' + moment(data.timestamp).format('h:mm:ss a') + '] ' + (data.username || 'Server') + ': ' ),
          text = $("<span/>").text(data.message).linkify(),
          html = $("<li/>").append(username).append(text);
      $messages.append(html);
    } else {
      console.log('Nope: ', data);
    }
  }

  var typers = {};

  function addTyper(data) {
    if (data && !typers[data.username]) {
      typers[data.username] = $('<span/>').text(data.username + ' is typing...').appendTo('#content');
    }
  }

  function removeTyper(data) {
    if (data) {
      typers[data.username].remove();
      delete typers[data.username];
    }
  }

  var typing = false;

  function sendMessage() {
    var text = $newMessage.val();
    if (text) {
      socket.emit('send', { message: text, username: user });
      $newMessage[0].value = '';
      typing = false;
    }
  }

  var typingTimeout = null;
  function isTyping() {
    if (typing) {
      socket.emit('typing', { username: user });
    } else {
      socket.emit('stopped typing', { username: user });
    }

    typingTimeout = setTimeout(isTyping, 2000);
  }

  socket.on("message", addMessage);
  socket.on("typing", addTyper);
  socket.on("stopped typing", removeTyper);

  $newMessage
    .on('keypress', function(e) {
      if ( e.keyCode == 13 ) {
        sendMessage();
      }
    })
    .on('keyup', function(e) {
      typing = !!this.value.length;
      if (!typingTimeout) isTyping();
    });

});
