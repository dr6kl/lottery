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

  function determineWinner(uint roundNum) {
    if (!(roundNum < currentRound())) {
      throw;
    }
    Round round = rounds[roundNum];
    if (round.winner != 0) {
      throw;
    }
    Participant[] participants = round.participants;
    uint rand = uint(block.blockhash(startBlock + (roundNum + 1) * duration)) % round.pot;

    uint s = 0;
    for (uint i = 0; i < participants.length; i++) {
      s += participants[i].amount;
      if (s > rand) {
        round.winner = participants[i].addr;
        break;
      }
    }
  }

  function getPrize(uint roundNum) {
    Round round = rounds[roundNum];
    if (!(round.winner == msg.sender) || round.prizeIsPaid) {
      throw;
    }
    round.prizeIsPaid = true;
    if (!round.winner.send(round.pot)) {
      round.prizeIsPaid = false;
    }
  }
}
