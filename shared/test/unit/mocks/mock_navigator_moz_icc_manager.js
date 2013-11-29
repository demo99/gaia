'use strict';

var MockIccManager = {
  _iccIds: [],
  _iccObjs: {},
  get iccIds() {
    return this._iccIds;
  },

  mAddMozIccObject: function iccm_addMozIcc(iccId, iccObj) {
    iccObj = iccObj || {
      addEventListener: function() {},
      removeEventListener: function() {}
    };

    if (!this._iccObjs[iccId]) {
      this._iccObjs[iccId] = iccObj;
      this._iccIds.push(iccId);
    }
  },

  mRemoveMozIccObject: function iccm_removeMozIcc(iccId) {
    var index = this._iccIds.indexOf(iccId);
    if (index >= 0) {
      this._iccIds.splice(index, 1);
    }
    this._iccObjs[iccId] = null;
  },

  mTeardown: function iccm_teardown() {
    this._iccIds = [];
    this._iccObjs = {};
  },

  addEventListener: function() {},
  removeEventListener: function() {},
  getIccById: function(iccId) {
    return this._iccObjs[iccId];
  }
};
