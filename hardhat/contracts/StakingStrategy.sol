// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BaseStrategy.sol";

/// @notice Simulates a staking protocol — 11% APY, risk 8/10
contract StakingStrategy is BaseStrategy {
    constructor(address _vault) BaseStrategy(_vault) {}

    function _apyBps() internal pure override returns (uint256) {
        return 1100;
    }

    function riskScore() external pure override returns (uint256) {
        return 8;
    }
}
