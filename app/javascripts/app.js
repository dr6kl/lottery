var contractJson = require('./../../build/contracts/Lottery.json');

var address = contractJson.networks['1'].address;
var abi = contractJson.abi;

var lottery = web3.eth.contract(abi).at(address);

document.write(lottery.currentRound());

