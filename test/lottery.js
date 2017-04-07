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

var addParticipants = function(lottery, n) {
  var addParticipant = function(i) {
    if (i == n) {
      return Promise.resolve();
    } else {
      return lottery.participate({value: web3.toWei(2), from: web3.eth.accounts[i]}).then(function() {return addParticipant(i + 1)});
    }
  }
  return addParticipant(0);
}

contract('Lottery', function(accounts) {
  it('works', function() {
    return Lottery.new(10).then(function(lottery) {
      return addParticipants(lottery, 3).then(function() {
        return lottery.determineWinner(0); // fails as round is not finished
      }).then(function() {
        return lottery.rounds(0);
      }).then(function(r) {
        assert.equal(r[0], web3.toWei(6));
        assert.equal(r[1], 0);
        assert.equal(r[2], false);
      }).then(function() {
        return skipBlocks(10);
      }).then(function() {
        return addParticipants(lottery, 2);
      }).then(function() {
        return lottery.getParticipantsLength(0);
      }).then(function(l) {
        return assert.equal(l, 3);
      }).then(function() {
        return lottery.determineWinner(0);
      }).then(function() {
        return lottery.rounds(0);
      }).then(function(r) {
        assert.equal(r[0], web3.toWei(6));
        assert.include(web3.eth.accounts, r[1]);
        assert.equal(r[2], false);
        return;
      }).then(function() {
        return lottery.getPrize(0, {from: web3.eth.accounts[3]});
      }).then(function() {
        return lottery.rounds(0);
      }).then(function(r) {
        assert.equal(r[2], false);
        return r[1];
      }).then(function(winner) {
        return lottery.getPrize(0, {from: winner});
      }).then(function() {
        return lottery.rounds(0);
      }).then(function(r) {
        assert.equal(r[2], true);
      });
    });
  });
});
