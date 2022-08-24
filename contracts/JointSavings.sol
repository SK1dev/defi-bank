// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.9;

contract JointSavings {

    address payable accountOne;
    address payable accountTwo;
    address public lastToWithdraw;
    uint public lastWithdrawAmount;
    uint public contractBalance;

    function withdraw(
        uint amount, 
        address payable recipient
        ) public {
        require(recipient == accountOne || recipient == accountTwo, "You don't own this account!");
        require(amount <= contractBalance, "Insufficient funds!");
        if (lastToWithdraw != recipient) {
            lastToWithdraw = recipient;
        }
        recipient.transfer(amount);
        lastWithdrawAmount = amount;
        contractBalance = address(this).balance;
        }
    function deposit() public payable {
        contractBalance = address(this).balance;
    }
    
    function setAccounts(
        address payable account1, 
        address payable account2
        ) public {
        accountOne = account1;
        accountTwo = account2;
    }

    //can store Ether sent from outside the deposit function.
    fallback() external payable {}
    receive() external payable {}  
}