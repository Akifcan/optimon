// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IStrategy.sol";

contract Vault {
    struct StrategyAllocation {
        IStrategy strategy;
        uint256 weight; // basis points, sum to 10000
    }

    address public owner;
    StrategyAllocation[] public strategies;
    uint256 public totalShares;
    mapping(address => uint256) public shares;

    event Deposit(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdraw(address indexed user, uint256 amount, uint256 sharesBurned);
    event Rebalance(uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- Admin ---

    function addStrategy(address _strategy, uint256 _weight) external onlyOwner {
        strategies.push(StrategyAllocation({
            strategy: IStrategy(_strategy),
            weight: _weight
        }));
    }

    function setWeights(uint256[] calldata _weights) external onlyOwner {
        require(_weights.length == strategies.length, "length mismatch");
        uint256 total;
        for (uint256 i = 0; i < _weights.length; i++) {
            strategies[i].weight = _weights[i];
            total += _weights[i];
        }
        require(total == 10000, "weights must sum to 10000");
    }

    // --- User ---

    function deposit() external payable {
        require(msg.value > 0, "zero deposit");
        require(strategies.length > 0, "no strategies");

        uint256 totalBefore = totalValue();
        uint256 sharesToMint;

        if (totalShares == 0) {
            sharesToMint = msg.value;
        } else {
            sharesToMint = (msg.value * totalShares) / totalBefore;
        }

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        uint256 remaining = msg.value;
        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 amount;
            if (i == strategies.length - 1) {
                amount = remaining;
            } else {
                amount = (msg.value * strategies[i].weight) / 10000;
                remaining -= amount;
            }
            if (amount > 0) {
                strategies[i].strategy.deposit{value: amount}();
            }
        }

        emit Deposit(msg.sender, msg.value, sharesToMint);
    }

    function withdraw() external {
        uint256 userShares = shares[msg.sender];
        require(userShares > 0, "no shares");

        uint256 total = totalValue();
        uint256 userAmount = (total * userShares) / totalShares;

        shares[msg.sender] = 0;
        totalShares -= userShares;

        uint256 remaining = userAmount;
        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 stratBal = strategies[i].strategy.totalBalance();
            uint256 amount;
            if (i == strategies.length - 1) {
                amount = remaining > stratBal ? stratBal : remaining;
            } else {
                amount = (userAmount * stratBal) / total;
                amount = amount > stratBal ? stratBal : amount;
                remaining -= amount;
            }
            if (amount > 0) {
                strategies[i].strategy.withdraw(amount);
            }
        }

        (bool ok, ) = msg.sender.call{value: address(this).balance}("");
        require(ok, "transfer failed");

        emit Withdraw(msg.sender, userAmount, userShares);
    }

    // --- Vault Operations ---

    function rebalance() external onlyOwner {
        for (uint256 i = 0; i < strategies.length; i++) {
            strategies[i].strategy.harvest();
        }

        uint256 total;
        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 bal = strategies[i].strategy.totalBalance();
            if (bal > 0) {
                strategies[i].strategy.withdraw(bal);
            }
            total += bal;
        }

        uint256 remaining = address(this).balance;
        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 amount;
            if (i == strategies.length - 1) {
                amount = remaining;
            } else {
                amount = (total * strategies[i].weight) / 10000;
                amount = amount > remaining ? remaining : amount;
                remaining -= amount;
            }
            if (amount > 0) {
                strategies[i].strategy.deposit{value: amount}();
            }
        }

        emit Rebalance(block.timestamp);
    }

    // --- View ---

    function totalValue() public view returns (uint256) {
        uint256 total = address(this).balance;
        for (uint256 i = 0; i < strategies.length; i++) {
            total += strategies[i].strategy.totalBalance();
        }
        return total;
    }

    function userValue(address _user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (totalValue() * shares[_user]) / totalShares;
    }

    function strategyCount() external view returns (uint256) {
        return strategies.length;
    }

    receive() external payable {}
}
