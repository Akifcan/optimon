// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BaseStrategy.sol";

/// @title LendingStrategy
/// @notice Simulates a lending protocol — 8% APY, risk 7/10
contract LendingStrategy is BaseStrategy {
    constructor(address _vault) BaseStrategy(_vault) {}

    function _apyBps() internal pure override returns (uint256) {
        return 800; // 8%
    }

    function riskScore() external pure override returns (uint256) {
        return 7;
    }

    receive() external payable {}
}
