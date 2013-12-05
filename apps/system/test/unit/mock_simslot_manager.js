var MockSIMSlotManager = {
  mInstances: [],
  getSlots: function() {
    return this.mInstances;
  },
  length: 0,
  mTeardown: function mssm_mTeardown() {
    this.mInstances = [];
    this.length = 0;
  }
};
