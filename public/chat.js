/*jshint laxcomma:true*/

/* encoding: utf-8

  ****  linkify plugin for jQuery - automatically finds and changes URLs in text content into proper hyperlinks  ****

  Version: 1.0

  Copyright (c) 2009
    Már Örlygsson  (http://mar.anomy.net/)  &
    Hugsmiðjan ehf. (http://www.hugsmidjan.is)

  Dual licensed under a MIT licence (http://en.wikipedia.org/wiki/MIT_License)
  and GPL 2.0 or above (http://www.gnu.org/licenses/old-licenses/gpl-2.0.html).

-----------------------------------------------------------------------------

  Demo and Qunit-tests:
    * <./jquery.linkify-1.0-demo.html>
    * <./jquery.linkify-1.0-test.html>

  Documentation:
    * ...

  Get updates from:
    * <http://github.com/maranomynet/linkify/>
    * <git://github.com/maranomynet/linkify.git>

-----------------------------------------------------------------------------

  Requires:
    * jQuery (1.2.6 or later)

  Usage:

      jQuery('.articlebody').linkify();

      // adding plugins:
      jQuery.extend( jQuery.fn.linkify.plugins, {
          name1: {
              re:   RegExp
              tmpl: String/Function
            },
          name2: function(html){ return html; }
        });

      // Uses all plugins by default:
      jQuery('.articlebody').linkify();

      // Use only certain plugins:
      jQuery('.articlebody').linkify( 'name1,name2' );
      jQuery('.articlebody').linkify({  use: 'name1,name2'  });
      jQuery('.articlebody').linkify({  use: ['name1','name2']  });

      // Explicitly use all plugins:
      jQuery('.articlebody').linkify('*');
      jQuery('.articlebody').linkify({  use: '*'  });
      jQuery('.articlebody').linkify({  use: ['*']  });

      // Use no plugins:
      jQuery('.articlebody').linkify('');
      jQuery('.articlebody').linkify({  use: ''  });
      jQuery('.articlebody').linkify({  use: []  });
      jQuery('.articlebody').linkify({  use: ['']  });

      // Perfmorm actions on all newly created links:
      jQuery('.articlebody').linkify( function (links){ links.addClass('linkified'); } );
      jQuery('.articlebody').linkify({  handleLinks: function (links){ links.addClass('linkified'); }  });

*/

(function($){

  var noProtocolUrl = /(^|["'(\s]|&lt;)(www\..+?\..+?)((?:[:?]|\.+)?(?:\s|$)|&gt;|[)"',])/g,
      httpOrMailtoUrl = /(^|["'(\s]|&lt;)((?:(?:https?|ftp):\/\/|mailto:).+?)((?:[:?]|\.+)?(?:\s|$)|&gt;|[)"',])/g,
      linkifier = function ( html ) {
          return html
                      .replace( noProtocolUrl, '$1<a href="<``>://$2">$2</a>$3' )  // NOTE: we escape `"http` as `"<``>` to make sure `httpOrMailtoUrl` below doesn't find it as a false-positive
                      .replace( httpOrMailtoUrl, '$1<a href="$2">$2</a>$3' )
                      .replace( /"<``>/g, '"http' );  // reinsert `"http`
        },


      linkify = $.fn.linkify = function ( cfg ) {
          if ( !$.isPlainObject( cfg ) )
          {
            cfg = {
                use:         (typeof cfg == 'string') ? cfg : undefined,
                handleLinks: $.isFunction(cfg) ? cfg : arguments[1]
              };
          }
          var use = cfg.use,
              allPlugins = linkify.plugins || {},
              plugins = [linkifier],
              tmpCont,
              newLinks = [],
              callback = cfg.handleLinks;
          if ( use == undefined ||  use == '*' ) // use === undefined  ||  use === null
          {
            for ( var name in allPlugins )
            {
              plugins.push( allPlugins[name] );
            }
          }
          else
          {
            use = $.isArray( use ) ? use : $.trim(use).split( / *, */ );
            var plugin,
                name;
            for ( var i=0, l=use.length;  i<l;  i++ )
            {
              name = use[i];
              plugin = allPlugins[name];
              if ( plugin )
              {
                plugins.push( plugin );
              }
            }
          }

          this.each(function () {
              var childNodes = this.childNodes,
                  i = childNodes.length;
              while ( i-- )
              {
                var n = childNodes[i];
                if ( n.nodeType == 3 )
                {
                  var html = n.nodeValue;
                  if ( html.length>1  &&  /\S/.test(html) )
                  {
                    var htmlChanged,
                        preHtml;
                    tmpCont = tmpCont || $('<div/>')[0];
                    tmpCont.innerHTML = '';
                    tmpCont.appendChild( n.cloneNode(false) );
                    var tmpContNodes = tmpCont.childNodes;

                    for (var j=0, plugin; (plugin = plugins[j]); j++)
                    {
                      var k = tmpContNodes.length,
                          tmpNode;
                      while ( k-- )
                      {
                        tmpNode = tmpContNodes[k];
                        if ( tmpNode.nodeType == 3 )
                        {
                          html = tmpNode.nodeValue;
                          if ( html.length>1  &&  /\S/.test(html) )
                          {
                            preHtml = html;
                            html = html
                                      .replace( /&/g, '&amp;' )
                                      .replace( /</g, '&lt;' )
                                      .replace( />/g, '&gt;' );
                            html = $.isFunction( plugin ) ? 
                                        plugin( html ):
                                        html.replace( plugin.re, plugin.tmpl );
                            htmlChanged = htmlChanged || preHtml!=html;
                            preHtml!=html  &&  $(tmpNode).after(html).remove();
                          }
                        }
                      }
                    }
                    html = tmpCont.innerHTML;
                    if ( callback )
                    {
                      html = $('<div/>').html(html);
                      //newLinks.push.apply( newLinks,  html.find('a').toArray() );
                      newLinks = newLinks.concat( html.find('a').toArray().reverse() );
                      html = html.contents();
                    }
                    htmlChanged  &&  $(n).after(html).remove();
                  }
                }
                else if ( n.nodeType == 1  &&  !/^(a|button|textarea)$/i.test(n.tagName) )
                {
                  arguments.callee.call( n );
                }
              };
          });
          callback  &&  callback( $(newLinks.reverse()) );
          return this;
        };

  linkify.plugins = {
      // default mailto: plugin
      mailto: {
          re: /(^|["'(\s]|&lt;)([^"'(\s&]+?@.+\.[a-z]{2,7})(([:?]|\.+)?(\s|$)|&gt;|[)"',])/gi,
          tmpl: '$1<a href="mailto:$2">$2</a>$3'
        }
    };

})(jQuery);

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

var printLine = function(message){
  $messages.append( $("<li/>").append( $("<code>").text(message) ).append("<br>") );
  $messages.scrollTop($messages.scrollTop()+10000);
};

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

        klasses.push( (!data.username ? 'log' : ( (username == data.username) ? 'you' : '' )) );

        var $user = $("<span/>").addClass(klasses.join(' ')).text( '[' + moment(data.timestamp).format('h:mm:ss a') + '] ' + (data.username || 'Server') + ': ' ),
            $text = $("<span/>").text(data.message).makeImages().linkify(),
            $html = $("<li/>").append($user).append($text);
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
