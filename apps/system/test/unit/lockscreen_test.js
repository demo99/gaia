'use strict';
requireApp('system/test/unit/mock_clock.js', function() {
  window.realClock = window.Clock;
  window.Clock = MockClock;
  window.realOrientationManager = window.OrientationManager;
  window.OrientationManager = {
    defaultOrientation: null
  };
requireApp('system/js/lockscreen.js');
});

requireApp('system/test/unit/mock_l10n.js');
requireApp('system/shared/test/unit/mocks/mock_settings_listener.js');
requireApp('system/shared/test/unit/mocks/mock_navigator_moz_mobile_connections.js');
requireApp('system/shared/test/unit/mocks/mock_navigator_moz_icc_manager.js');
requireApp('system/shared/test/unit/mocks/mock_mobile_operator.js');
requireApp('system/test/unit/mock_navigator_moz_telephony.js');
requireApp('system/test/unit/mock_ftu_launcher.js');

if (!this.MobileOperator) {
  this.MobileOperator = null;
}

if (!this.FtuLauncher) {
  this.FtuLauncher = null;
}

if (!this.SettingsListener) {
  this.SettingsListener = null;
}

suite('system/LockScreen >', function() {
  var subject;
  var realOrientationManager;
  var realL10n;
  var realMobileOperator;
  var realMobileConnections;
  var realIccManager;
  var realMozTelephony;
  var realClock;
  var realFtuLauncher;
  var realSettingsListener;
  var domConnStates;
  var domConnstateL1;
  var domConnstateL2;
  var domPasscodePad;
  var domEmergencyCallBtn;
  var domOverlay;
  var domPasscodeCode;
  var domMainScreen;
  var DUMMYTEXT1 = 'foo';

  setup(function() {
    subject = window.LockScreen;
    realL10n = navigator.mozL10n;
    navigator.mozL10n = window.MockL10n;

    realMobileOperator = window.MobileOperator;
    window.MobileOperator = MockMobileOperator;

    realOrientationManager = window.OrientationManager;
    window.OrientationManager = {
      defaultOrientation: null
    };

    realMozTelephony = navigator.mozTelephony;
    navigator.mozTelephony = window.MockNavigatorMozTelephony;

    realClock = window.Clock;
    window.Clock = MockClock;

    realFtuLauncher = window.FtuLauncher;
    window.FtuLauncher = MockFtuLauncher;

    realMobileConnections = navigator.mozMobileConnections;
    navigator.mozMobileConnections = MockNavigatorMozMobileConnections;

    realIccManager = navigator.mozIccManager;
    navigator.mozIccManager = MockIccManager;

    realSettingsListener = window.SettingsListener;
    window.SettingsListener = MockSettingsListener;

    domConnStates = document.createElement('div');
    domConnStates.id = 'lockscreen-conn-states';
    document.body.appendChild(domConnStates);

    domPasscodePad = document.createElement('div');
    domPasscodePad.id = 'lockscreen-passcode-pad';
    domEmergencyCallBtn = document.createElement('a');
    domEmergencyCallBtn.dataset.key = 'e';
    domPasscodePad.appendChild(domEmergencyCallBtn);
    domOverlay = document.createElement('div');
    domPasscodeCode = document.createElement('div');
    document.body.appendChild(domPasscodePad);
    domMainScreen = document.createElement('div');
    subject.passcodePad = domPasscodePad;

    subject.connStates = domConnStates;
    var mockClock = {
      stop: function() {}
    };
    subject.overlay = domOverlay;
    subject.mainScreen = domMainScreen;
    subject.clock = mockClock;
    subject.lock();
  });

  suite('Single sim devices', function() {
    var domConnstateIDLine;
    var domConnstateL1;
    var domConnstateL2;
    var iccObj;

    suiteSetup(function() {
      MockMobileOperator.mOperator = 'operator';
      MockMobileOperator.mCarrier = 'carrier';
      MockMobileOperator.mRegion = 'region';
    });

    suiteTeardown(function() {
      MockMobileOperator.mTeardown();
    });

    setup(function() {
      // add a sim card
      MockNavigatorMozMobileConnections[0].iccId = 'iccid1';
      MockIccManager.mAddMozIccObject('iccid1');
      iccObj = MockIccManager.getIccById('iccid1');

      subject.initConnectionStates();

      var domConnState = domConnStates.children[0];
      domConnstateIDLine = domConnState.children[0];
      domConnstateL1 = domConnState.children[1];
      domConnstateL2 = domConnState.children[2];
    });

    teardown(function() {
      MockIccManager.mTeardown();
      MockNavigatorMozMobileConnections.mTeardown();
    });

    test('2G Mode: should update cell broadcast info on connstate Line 2',
      function() {
        MockNavigatorMozMobileConnections[0].voice = {
          connected: true,
          type: 'gsm'
        };
        subject.cellbroadcastLabel = DUMMYTEXT1;
        subject.updateConnStates();
        assert.equal(domConnstateL2.textContent, DUMMYTEXT1);

        subject.cellbroadcastLabel = null;
    });

    test('3G Mode: should update carrier and region info on connstate Line 2',
      function() {
        MockNavigatorMozMobileConnections[0].voice = {
          connected: true,
          type: 'wcdma'
        };
        var carrier = 'TIM';
        var region = 'SP';
        var exceptedText = 'TIM SP';
        MobileOperator.mCarrier = carrier;
        MobileOperator.mRegion = region;
        subject.cellbroadcastLabel = DUMMYTEXT1;
        subject.updateConnStates();
        assert.equal(domConnstateL2.textContent, exceptedText);

        subject.cellbroadcastLabel = null;
    });

    test('Show no network', function() {
      MockNavigatorMozMobileConnections[0].voice = {
        connected: true,
        state: 'notSearching'
      };
      subject.updateConnStates();
      assert.equal(domConnstateL1.textContent, 'noNetwork');
    });

    test('Show searching', function() {
      MockNavigatorMozMobileConnections[0].voice = {
        connected: false,
        emergencyCallsOnly: false
      };
      subject.updateConnStates();
      assert.equal(domConnstateL1.textContent, 'searching');
    });

    test('Show roaming', function() {
      MockNavigatorMozMobileConnections[0].voice = {
        connected: true,
        emergencyCallsOnly: false,
        roaming: true
      };
      subject.updateConnStates();
      assert.equal(domConnstateL1.textContent,
        'roaming"{\\"operator\\":\\"' + MockMobileOperator.mOperator + '\\"}"');
    });

    suite('Show correct card states when emergency calls only', function() {
      test('unknown', function() {
        MockNavigatorMozMobileConnections[0].voice = {
          connected: false,
          emergencyCallsOnly: true
        };
        iccObj.cardState = 'unknown';

        subject.updateConnStates();
        assert.equal(domConnstateL1.textContent, 'emergencyCallsOnly');
        assert.equal(domConnstateL2.textContent,
          'emergencyCallsOnly-unknownSIMState');
      });

      test('other card state', function() {
        MockNavigatorMozMobileConnections[0].voice = {
          connected: false,
          emergencyCallsOnly: true
        };
        iccObj.cardState = 'otherCardState';

        subject.updateConnStates();
        assert.equal(domConnstateL1.textContent, 'emergencyCallsOnly');
        assert.equal(domConnstateL2.textContent, '');
      });

      ['pinRequired', 'pukRequired', 'networkLocked',
       'serviceProviderLocked', 'corporateLocked'].forEach(function(cardState) {
        test(cardState, function() {
          MockNavigatorMozMobileConnections[0].voice = {
            connected: false,
            emergencyCallsOnly: true
          };
          iccObj.cardState = cardState;

          subject.updateConnStates();
          assert.equal(domConnstateL1.textContent, 'emergencyCallsOnly');
          assert.equal(domConnstateL2.textContent,
            'emergencyCallsOnly-' + cardState);
        });
      });
    });
  });

  suite('Multiple sims devices', function() {
    var domConnStateList;

    suiteSetup(function() {
      MockNavigatorMozMobileConnections.mAddMobileConnection();
    });

    suiteTeardown(function() {
      MockNavigatorMozMobileConnections.mRemoveMobileConnection();
    });

    setup(function() {
      subject.initConnectionStates();

      domConnStateList = [];
      Array.prototype.forEach.call(domConnStates.children,
        function(domConnState) {
          domConnState.domConnstateIDLine = domConnState.children[0];
          domConnState.domConnstateL1 = domConnState.children[1];
          domConnState.domConnstateL2 = domConnState.children[2];
          domConnStateList.push(domConnState);
      });
    });

    suite('No sim card', function() {
      setup(function() {
        MockNavigatorMozMobileConnections[0].voice = {
          connected: false,
          type: 'gsm'
        };
      });

      teardown(function() {
        MockNavigatorMozMobileConnections[0].voice = {};
      });

      test('Should only show one conn state', function() {
        subject.updateConnStates();

        assert.equal(domConnStateList[0].domConnstateL1.textContent,
          'emergencyCallsOnly-noSIM');
        assert.equal(domConnStateList[1].domConnstateL1.textContent, '');
        assert.equal(domConnStateList[1].domConnstateL2.textContent, '');
      });

      test('Should show emergency call text', function() {
        MockNavigatorMozMobileConnections[0].voice.emergencyCallsOnly = true;
        subject.updateConnStates();

        assert.equal(domConnStateList[0].domConnstateL1.textContent,
          'emergencyCallsOnly');
        assert.equal(domConnStateList[0].domConnstateL2.textContent,
          'emergencyCallsOnly-noSIM');
        assert.equal(domConnStateList[1].domConnstateL1.textContent, '');
        assert.equal(domConnStateList[1].domConnstateL2.textContent, '');
      });
    });

    suite('One sim card inserted', function() {
      suiteSetup(function() {
        MockNavigatorMozMobileConnections[0].voice = {
          connected: true,
          type: 'gsm'
        };
        MockNavigatorMozMobileConnections[1].voice = {};

        // add a sim card
        MockNavigatorMozMobileConnections[0].iccId = 'iccid1';
        MockIccManager.mAddMozIccObject('iccid1');
      });

      suiteTeardown(function() {
        MockNavigatorMozMobileConnections.mTeardown();
        MockIccManager.mTeardown();
      });

      test('Should show sim ID', function() {
        subject.updateConnStates();

        var simIDLine = domConnStateList[0].domConnstateIDLine;
        assert.isFalse(simIDLine.hidden);
        assert.equal(simIDLine.textContent, 'SIM 1');
      });

      test('Should show only one conn state', function() {
        subject.updateConnStates();

        assert.isFalse(domConnStateList[0].hidden);
        assert.isTrue(domConnStateList[1].hidden);
      });

      test('Should show airplane mode on connstate 1 Line 1 when in ' +
        'airplane mode', function() {
          subject.airplaneMode = true;
          subject.updateConnStates();

          assert.isFalse(domConnStateList[0].hidden);
          assert.isTrue(domConnStateList[0].domConnstateIDLine.hidden);
          assert.equal(domConnStateList[0].domConnstateL1.textContent,
            'airplaneMode');
          assert.equal(domConnStateList[0].domConnstateL2.textContent, '');

          subject.airplaneMode = false;
      });
    });

    suite('Two sim cards inserted', function() {
      suiteSetup(function() {
        MockNavigatorMozMobileConnections[0].voice = {
          connected: true,
          type: 'gsm'
        };
        MockNavigatorMozMobileConnections[1].voice = {
          connected: true,
          type: 'gsm'
        };

        MockMobileOperator.mOperator = 'operator';
        MockMobileOperator.mCarrier = 'carrier';
        MockMobileOperator.mRegion = 'region';

        // add two sim cards
        MockNavigatorMozMobileConnections[0].iccId = 'iccid1';
        MockIccManager.mAddMozIccObject('iccid1');
        MockNavigatorMozMobileConnections[1].iccId = 'iccid2';
        MockIccManager.mAddMozIccObject('iccid2');
      });

      suiteTeardown(function() {
        MockNavigatorMozMobileConnections.mTeardown();
        MockIccManager.mTeardown();
        MockMobileOperator.mTeardown();
      });

      test('Should show sim IDs', function() {
        subject.updateConnStates();

        var simIDLine1 = domConnStateList[0].domConnstateIDLine;
        var simIDLine2 = domConnStateList[1].domConnstateIDLine;
        assert.isFalse(simIDLine1.hidden);
        assert.isFalse(simIDLine2.hidden);
        assert.equal(simIDLine1.textContent, 'SIM 1');
        assert.equal(simIDLine2.textContent, 'SIM 2');
      });

      test('Should show operator names on Line 1', function() {
        subject.updateConnStates();

        var connState1line1 = domConnStateList[0].domConnstateL1;
        var connState2line1 = domConnStateList[1].domConnstateL1;
        assert.equal(connState1line1.textContent, MockMobileOperator.mOperator);
        assert.equal(connState2line1.textContent, MockMobileOperator.mOperator);
      });

      test('Should show carrier and region on Line 2', function() {
        subject.updateConnStates();

        var connState1line2 = domConnStateList[0].domConnstateL2;
        var connState2line2 = domConnStateList[1].domConnstateL2;
        assert.equal(connState1line2.textContent,
          MockMobileOperator.mCarrier + ' ' + MockMobileOperator.mRegion);
        assert.equal(connState2line2.textContent,
          MockMobileOperator.mCarrier + ' ' + MockMobileOperator.mRegion);
      });
    });
  });

  test('Emergency call: should disable emergency-call button',
    function() {
      var stubSwitchPanel = this.sinon.stub(subject, 'switchPanel');
      navigator.mozTelephony.calls = {length: 1};
      var evt = {type: 'callschanged'};
      subject.handleEvent(evt);
      assert.isTrue(domEmergencyCallBtn.classList.contains('disabled'));
      stubSwitchPanel.restore();
  });

  test('Emergency call: should enable emergency-call button',
    function() {
      var stubSwitchPanel = this.sinon.stub(subject, 'switchPanel');
      navigator.mozTelephony.calls = {length: 0};
      var evt = {type: 'callschanged'};
      subject.handleEvent(evt);
      assert.isFalse(domEmergencyCallBtn.classList.contains('disabled'));
      stubSwitchPanel.restore();
  });

  test('Lock: can actually lock', function() {
    var mockLO = sinon.stub(screen, 'mozLockOrientation');
    subject.overlay = domOverlay;
    subject.lock();
    assert.isTrue(subject.locked);
    mockLO.restore();
  });

  test('Unlock: can actually unlock', function() {
    subject.overlay = domOverlay;
    subject.unlock(true);
    assert.isFalse(subject.locked);
  });

  test('Passcode: enter passcode can unlock the screen', function() {
    subject.passCodeEntered = '0000';
    subject.passCode = '0000';
    subject.passcodeCode = domPasscodeCode;
    subject.checkPassCode();
    assert.equal(subject.overlay.dataset.passcodeStatus, 'success');
  });

  test('Passcode: enter passcode can unlock the screen', function() {
    subject.passCodeEntered = '0000';
    subject.passCode = '3141';

    subject.passcodeCode = domPasscodeCode;
    subject.checkPassCode();
    assert.equal(subject.overlay.dataset.passcodeStatus, 'error');
  });

  // XXX: Test 'Screen off: by proximity sensor'.

  teardown(function() {
    navigator.mozL10n = realL10n;
    window.MobileOperator = realMobileOperator;
    window.navigator.mozMobileConnections = realMobileConnections;
    window.navigator.mozIccManager = realIccManager;
    navigator.mozTelephony = realMozTelephony;
    window.Clock = window.realClock;
    window.FtuLauncher = realFtuLauncher;
    window.OrientationManager = window.realOrientationManager;
    window.SettingsListener = realSettingsListener;

    document.body.removeChild(domConnStates);
    document.body.removeChild(domPasscodePad);
    subject.passcodePad = null;

    MockSettingsListener.mTeardown();
  });
});
