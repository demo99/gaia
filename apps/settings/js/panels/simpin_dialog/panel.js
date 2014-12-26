define(function() {
  'use strict';

  var DialogPanel = require('modules/dialog_panel');
  var SimPinDialog = require('modules/simpin_dialog');

  return function ctor_simpin_dialog() {
    return DialogPanel({
      onInit: function(panel) {
        this._pinDialog = null;
        this._method = '';
      },
      onBeforeShow: function(panel, options) {
        var method = options.method; // get_pin2, change_pin2 ... 
        var pinOptions = options.pinOptions || {};

        this._method = method;

        // bind SimPinDialog on related elements
        this._pinDialog = new SimPinDialog(panel);

        // by pass stuffs to SimPinDialog
        this._pinDialog.show(method, pinOptions);
      },
      onShow: function(panel, options) {
        if (this._method === 'unlock_puk' || this._method === 'unlock_puk2') {
          this._pinDialog.pukInput.focus();
        } else {
          this._pinDialog.pinInput.focus();
        }
      },
      onSubmit: function() {
        return this._pinDialog.verify();
      },
      onCancel: function() {
        return this._pinDialog.skip();
      }
    });
  };
});
