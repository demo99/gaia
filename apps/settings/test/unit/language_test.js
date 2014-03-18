'use strict';
/* global MockL10n */

requireApp('settings/test/unit/mock_l10n.js');

mocha.globals(['KeyboardHelper']);

suite('Languages > ', function() {
  var Languages;
  var realL10n;
  
  suiteSetup(function(done) {
    realL10n = window.navigator.mozL10n;
    window.navigator.mozL10n = MockL10n;

    testRequire(['panels/languages/languages'], function(languages) {
      Languages = languages;
      done();
    });
  });

  suiteTeardown(function() {
    window.navigator.mozL10n = realL10n;
  });

  suite('when localized change', function() {
    setup(function() {
      this.sinon.stub(Languages, 'init');
      this.sinon.stub(Languages, 'update');
      Languages.initWhenL10nReady();
    });
    test('we would call init()', function() {
      assert.ok(Languages.init.called);
    });
    test('we would call update() when localized event coming', function() {
      window.dispatchEvent(new CustomEvent('localized'));
      assert.ok(Languages.update.called);
    });
  });
});
