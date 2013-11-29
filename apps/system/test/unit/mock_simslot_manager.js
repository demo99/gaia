var MockSIMSlotManager = {
  mInstances: [],
  getSlots: function() {
    return this.mInstances;
  },
  isMultiSIM: function() {},
  noSIMCardOnDevice: function() {},
  length: 0,
  mTeardown: function mssm_mTeardown() {
    this.mInstances = [];
    this.length = 0;
  }
};
