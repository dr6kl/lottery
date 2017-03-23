var Lottery = artifacts.require("./Lottery.sol");

var skipBlocks = function(n) {
  return new Promise(function(resolve, reject) {
    var currentBlock = web3.eth.blockNumber;
    var f = function() {
      if (web3.eth.blockNumber > currentBlock + n) {
        resolve();
      } else {
        setTimeout(f, 500);
      }
    };
    f();
  });
}

contract('Lottery', function(accounts) {
  it('works', function() {
    return Lottery.new(10).then(function(lottery) {
      return lottery.participate({value: web3.toWei(1), from: accounts[0]}).then(function() {
        return lottery.participate({value: web3.toWei(2), from: accounts[1]});
      }).then(function() {
        return lottery.participate({value: web3.toWei(3), from: accounts[2]});
      }).then(function() {
        return skipBlocks(10);
      }).then(function() {
        return lottery.participate({value: web3.toWei(1), from: accounts[0]});
      }).then(function() {
        return lottery.participate({value: web3.toWei(1), from: accounts[1]});
      }).then(function() {
        return lottery.getParticipantsLength(0);
      }).then(function(l) {
        return assert.equal(l, 3);
      }).then(function() {
        return lottery.getParticipantsLength(1);
      }).then(function(l) {
        return assert.equal(l, 2);
      });
    });
  });
});
