var Lottery = artifacts.require("./Lottery.sol");

contract('Lottery', function(accounts) {
  it('works', function() {
    return Lottery.deployed().then(function() {
      return assert.equal(1, 1);
    });
  });
});
