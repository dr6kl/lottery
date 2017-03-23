pragma solidity ^0.4.4;

contract Lottery {
  struct Participant {
    address addr;
    uint amount;
  }

  struct Round {
    Participant[] participants;
    address winner;
  }

  uint public startBlock;
  uint public duration;

  mapping (uint => Round) rounds;

  function Lottery(uint _duration) {
    startBlock = block.number;
    duration = _duration;
  }

  function participate() payable {
    uint r = currentRound();
    uint i = rounds[r].participants.length++;
    rounds[r].participants[i].addr = msg.sender;
    rounds[r].participants[i].amount = msg.value;
  }

  function currentRound() constant returns (uint) {
    return (block.number - startBlock) / duration;
  }

  function getParticipantsLength(uint num) constant returns (uint) {
    return rounds[num].participants.length;
  }
}
