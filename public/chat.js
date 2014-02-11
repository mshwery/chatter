$(document).ready(function() {

  var messages = [],
      socket = io.connect('http://localhost:3000'),
      user = 'FedMate ' + parseInt(Math.random() * 1000, 10);

  // dom els
  var $newMessage = $('.new-message');
  var $messages = $("#messages");
  var name = document.getElementById('name');

  function addMessage(data) {
    if (data) {
      messages.push(data.message);
      var klass = !data.username ? 'log' : ( (user == data.username) ? 'you' : '' );
      var username = $("<b/>").addClass(klass).text( (data.username || 'Server') + ': ' ),
          text = $("<span/>").text(data.message),
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