'use strict';
(function(exports) {
  var clickMeButton = document.querySelector('.click-me');
  clickMeButton.onclick = function() {
    alert('clicked');
  };

}(window));
