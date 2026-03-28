// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStrategy {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function harvest() external;
    function totalBalance() external view returns (uint256);
    function apyBps() external pure returns (uint256);
    function riskScore() external pure returns (uint256);
}
