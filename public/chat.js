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
      socket = io.connect('http://localhost:3000'),
      user = 'FedMate ' + parseInt(Math.random() * 1000, 10);

  // dom els
  var $newMessage = $('.new-message'),
      $messages = $("#messages");

  function addMessage(data) {
    if (data) {
      messages.push(data.message);
      var klass = !data.username ? 'log' : ( (user == data.username) ? 'you' : '' );
      var username = $("<b/>").addClass(klass).text( '[' + moment(data.timestamp).format('h:mm:ss a') + '] ' + (data.username || 'Server') + ': ' ),
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
      socket.emit('send', { message: text, username: user });
      $newMessage[0].value = '';
    }
  }

  socket.on("message", addMessage);

  $newMessage.on('keypress', function(e) {
    if ( e.keyCode == 13 ) {
      sendMessage();
    }
  });

});
