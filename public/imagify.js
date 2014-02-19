(function() {

  var imageUrlRegex = /(https?:\/\/.*\.(?:png|jpe?g|gif))/i;

  function urlToImage(text) {
    return text.replace(imageUrlRegex,"$1 <br/><a class='img' href='$1' target='_blank'><img src='$1'/></a>");
  }

  $.fn.makeImages = function() {
    var textNodes = this.contents().filter(function () { return this.nodeType === 3; });
    textNodes.each(function() {
      $(this).replaceWith( urlToImage( this.textContent ) );
    });
    return this;
  };

})();