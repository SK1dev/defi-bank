// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JointSavings {

    address owner;
    
    struct Account {
    address payable accountHolderOne;
    address payable accountHolderTwo;
    address lastToWithdraw;
    uint256 lastWithdrawAmount;
    uint256 balance;
    }

    mapping(address => Account) public users;
    
    event LogDeposit(address _address, uint256 _amount);
    event LogWithdrawal(address _address, uint256 _amount);
    event Received(address, uint256);

    modifier validAmount(uint256 _amount) {
      require(_amount > 0, 'Amount is not valid');
      _;
    }

    constructor() {
    owner = msg.sender;
    }

    function deposit(
      address _address, 
      uint256 _amount
      ) public payable 
      validAmount(_amount) 
      returns (uint) {
      users[_address].balance += _amount;
      (bool success, ) = _address.call{value: _amount}('');
      require(success, 'Failed to send ETH');
      emit LogDeposit(_address, _amount);
      return users[_address].balance;  
    }
    
    function setAccounts(
      address payable _account1, 
      address payable _account2
      ) public {
      users[msg.sender].accountHolderOne = _account1;
      users[msg.sender].accountHolderTwo = _account2;
    }

    function withdraw(
      uint256 _withdrawAmount, 
      address payable _recipient
      ) public {
      require(_recipient == users[msg.sender].accountHolderOne || 
      _recipient == users[msg.sender].accountHolderTwo, 
      "You don't own this account!");
      if (users[msg.sender].lastToWithdraw != _recipient) {
        users[msg.sender].lastToWithdraw = _recipient;
      }
      (bool success, ) = msg.sender.call{value: _withdrawAmount}('');
      require(success, 'Failed to send ETH');
      users[msg.sender].lastWithdrawAmount = _withdrawAmount;
      emit LogWithdrawal(msg.sender, _withdrawAmount);
    }

    //can store ether sent from outside the deposit function.
    receive() external payable { 
      users[msg.sender].balance += msg.value;
      emit Received(msg.sender, msg.value);
    }

    function getBalance(address _address) external view returns(uint256) {
      return users[_address].balance;
  }
}