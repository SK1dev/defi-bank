// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './Token.sol';

contract Loan {

    Token private token;

    mapping(address => uint) public depositStart;
    mapping(address => uint) public etherBalanceOf;
    mapping(address => uint) public collateralEther;
    mapping(address => bool) public isDeposited;
    mapping(address => bool) public isBorrowed;

    event Deposit(address indexed user, uint etherAmount, uint timeStart);
    event Withdraw(address indexed user, uint etherAmount, uint depositTime, uint interest);
    event Borrow(address indexed user, uint collateralEtherAmount, uint borrowedTokenAmount);
    event PayOff(address indexed user, uint fee);

    constructor(Token _token) {
        token = _token;
    }

    function deposit() public payable {
        require(isDeposited[msg.sender] == false, 'Deposit already active');
        require(msg.value>=1e16, 'Deposit must be >= 0.01 ETH');

        etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
        depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;

        isDeposited[msg.sender] = true; // activate deposit status
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() public {
        require(isDeposited[msg.sender] == true, 'No previous deposit');
        uint userBalance = etherBalanceOf[msg.sender]; // for event

        // check user's hodl time
        uint depositTime = block.timestamp - depositStart[msg.sender];

        /* interestPerSecond == 31668017 * deposit amount / 1e16)
        (31668017 * (1000000000000000000 / 1e16)
        interest == interestPerSecond * depositTime

        365 Days = 31,536,000 Seconds = 31536000 Seconds

        This contract imports Token.sol, that imports the OpenZeppelin ERC20.sol.
        This defines 18 decimal places. So you need to account for 18 decimals to get the total amount of tokens
        that you get as the interest.
        */

        uint interestPerSecond = 31668017 * (etherBalanceOf[msg.sender] / 1e16);
        uint interest = interestPerSecond * depositTime;

        // send funds to user
        payable(msg.sender).transfer(etherBalanceOf[msg.sender]); // ETh back to user
        token.mint(msg.sender, interest); // Interest to user

        // reset depositer data
        depositStart[msg.sender] = 0;
        etherBalanceOf[msg.sender] = 0;
        isDeposited[msg.sender] = false;

        emit Withdraw(msg.sender, userBalance, depositTime, interest);
    }

    function borrow() public payable {
        require(msg.value >= 1e16, 'Collateral must be >= 0.01 ETH');
        require(isBorrowed[msg.sender] == false, 'Loan already taken');

        // ether will be locked until the user pays off the loan
        collateralEther[msg.sender] = collateralEther[msg.sender] + msg.value;

        // token amount to mint (50% of msg.value)
        uint tokensToMint = collateralEther[msg.sender] / 2;

        // mint and send tokens to user
        token.mint(msg.sender, tokensToMint);

        // activate borrower's loan status
        isBorrowed[msg.sender] = true;

        emit Borrow(msg.sender, collateralEther[msg.sender], tokensToMint);
    }

    function payOff() public {
        require(isBorrowed[msg.sender] == true, 'Loan is not active');
        require(token.transferFrom(msg.sender, address(this), collateralEther[msg.sender] / 2),
            "Can't receive tokens"); // Must approve BankX

        uint fee = collateralEther[msg.sender] / 10; // 10% fee

        // send user's collateral minus fee
        payable(msg.sender).transfer(collateralEther[msg.sender] -  fee);

        // reset borrower's data
        collateralEther[msg.sender] = 0;
        isBorrowed[msg.sender] = false;

        emit PayOff(msg.sender, fee);
    }
}