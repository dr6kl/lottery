var $ = require('./../bower_components/jquery/dist/jquery.js');
var tmpl = require('./../bower_components/blueimp-tmpl/js/tmpl.js');
var contractJson = require('./../../build/contracts/Lottery.json');

var address = contractJson.networks[Object.keys(contractJson.networks)[0]].address;
var abi = contractJson.abi;

var lottery = web3.eth.contract(abi).at(address);

var renderData = function(rounds) {
  var html = `
    <div>
      <input type="text" class="amount" placeholder="amount">
      <button class="participate">Participate</button><br>
      <br>
      <div class="rounds"></div
    <div>
  `
  var el = $(html);
  el.find('.participate').click(function() {
    var value = el.find('.amount').val();
    lottery.participate({from: web3.eth.accounts[0], value: web3.toWei(value)});
  });

  var roundsEl = el.find('.rounds');
  var endsAt = lottery.startBlock().plus(lottery.currentRound().plus(new BigNumber(1)).times(lottery.duration()));
  roundsEl.append($('<h2> Current round (ends at block number ' + endsAt + '): </h2>'));
  for (var i = 0; i < rounds.length; i++) {
    var childEl = renderRound(rounds[i]);
    roundsEl.append(childEl);
    if (i == 0) {
      roundsEl.append($('<h2> Previous rounds: </h2>'));
    }
  }
  return el;
}

var renderRound = function(round) {
  var template = `
    <div style="border: 1px solid; margin-top: 10px">
      <b> Round number: </b> {%= o.roundNum %} <br>
      <b> Pot: </b> {%= web3.fromWei(o.pot) %} <br>
      <b> Participants: </b> <br>
      {% if (o.participants.length > 0) { %}
        {% for (var i = 0; i < o.participants.length; i++) { %}
          {%= o.participants[i].addr %} -
          {%= web3.fromWei(o.participants[i].amount) %} ether
          <br>
        {% } %}
      {% } else { %}
        No participants <br>
      {% } %}
      {% if (o.winner != '0x0000000000000000000000000000000000000000') { %}
        <b> Winner: </b> {%= o.winner %} <br>
      {% } %}
      <b> Prize paid: </b> {%= o.prizeIsPaid %} <br>
      <button class="get-prize"> Get prize </button>
    </div>
  `;
  var el = $(tmpl(template, round));
  el.find('.determine-winner').click(function() {
    lottery.determineWinner(round.roundNum, {from: web3.eth.accounts[0]});
  });
  el.find('.get-prize').click(function() {
    lottery.getPrize(round.roundNum, {from: web3.eth.accounts[0]});
  });
  return el;
}

var loadData = function() {
  var data = [];
  var currentRound = lottery.currentRound();
  for (var rNum = currentRound; rNum >= 0 && rNum >= currentRound - 30; rNum--) {
    var roundData = lottery.rounds(rNum);
    var pot = roundData[0];
    var prizeIsPaid = roundData[2];
    var participantsLength = lottery.getParticipantsLength(rNum);
    var participants = [];
    for (var i = 0; i < participantsLength; i++) {
      var pData = lottery.getParticipant(rNum, i);
      participants.push({addr: pData[0], amount: pData[1]});
    }
    var winner = lottery.getWinner(rNum);
    data.push({
      roundNum: rNum,
      participants: participants,
      pot: roundData[0],
      winner: winner,
      prizeIsPaid: roundData[2]
    });
  }
  return data;
};

var data = loadData();
var html = renderData(data);

$(document).ready(function() {
  $('body').html(html);
});

