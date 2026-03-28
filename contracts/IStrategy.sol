// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStrategy {
    /// @notice Deposit funds into the strategy
    function deposit() external payable;

    /// @notice Withdraw funds from the strategy
    /// @param amount The amount to withdraw
    function withdraw(uint256 amount) external;

    /// @notice Harvest accrued yield and send it to the vault
    function harvest() external;

    /// @notice Total balance held by this strategy (principal + yield)
    function totalBalance() external view returns (uint256);

    /// @notice Current APY in basis points (e.g. 800 = 8%)
    function apyBps() external view returns (uint256);

    /// @notice Risk score 1-10
    function riskScore() external view returns (uint256);
}
