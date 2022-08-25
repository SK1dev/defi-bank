// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
  address public minter;

  event MinterChanged(address indexed from, address to);

  constructor() payable 
  ERC20(
    'BankX Crypto Bank', 
    'BAX') {
    minter = msg.sender; //only initially
  }

  function passMinterRole(address bankX) public returns (bool) {
  	require(msg.sender==minter, 'Only owner can change pass minter role');
  	minter = bankX;

    emit MinterChanged(msg.sender, bankX);
    return true;
  }

  function mint(address account, uint256 amount) public {
		require(msg.sender==minter, 'msg.sender does not have minter role'); //bankX
		_mint(account, amount);
	}
}