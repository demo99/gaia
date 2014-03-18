'use strict';

define([
  'modules/settings_panel',
  'panels/languages/languages'
], function(Panel, Languages) {
  return function() {
    return Panel({
      onInit: function() {
        Languages.initWhenL10nReady();
      }
    });
  };
});
