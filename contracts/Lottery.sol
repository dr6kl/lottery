pragma solidity ^0.4.4;

contract Lottery {
  struct Participant {
    address addr;
    uint amount;
  }

  struct Round {
    Participant[] participants;
    uint pot;
    address winner;
    bool prizeIsPaid;
  }

  uint public startBlock;
  uint public duration;

  mapping (uint => Round) public rounds;

  function Lottery(uint _duration) {
    startBlock = block.number;
    duration = _duration;
  }

  function participate() payable {
    if (msg.value == 0) {
      throw;
    }
    uint r = currentRound();
    uint i = rounds[r].participants.length++;
    rounds[r].participants[i].addr = msg.sender;
    rounds[r].participants[i].amount = msg.value;
    rounds[r].pot += msg.value;
  }

  function currentRound() constant returns (uint) {
    return (block.number - startBlock) / duration;
  }

  function getParticipantsLength(uint num) constant returns (uint) {
    return rounds[num].participants.length;
  }

  function getParticipant(uint roundNum, uint idx) constant returns (address, uint) {
    Participant p = rounds[roundNum].participants[idx];
    return (p.addr, p.amount);
  }

  function getWinner(uint roundNum) constant returns (address) {
    if (roundNum >= currentRound()) {
      return address(0);
    }
    Round round = rounds[roundNum];
    if (round.winner != address(0)) {
      return round.winner;
    }

    Participant[] participants = round.participants;
    if (participants.length == 0) {
      return address(0);
    }

    uint blockHash = uint(block.blockhash(startBlock + (roundNum + 1) * duration));
    if (blockHash == 0) {
      return address(0);
    }
    uint rand = blockHash % round.pot;

    uint s = 0;
    for (uint i = 0; i < participants.length; i++) {
      s += participants[i].amount;
      if (s > rand) {
        return participants[i].addr;
      }
    }
  }

  function getPrize(uint roundNum) {
    address winner = getWinner(roundNum);
    Round round = rounds[roundNum];
    if ((winner != msg.sender) || round.prizeIsPaid) {
      throw;
    }
    round.winner = winner;
    round.prizeIsPaid = true;
    if (!round.winner.send(round.pot)) {
      round.prizeIsPaid = false;
    }
  }
}
