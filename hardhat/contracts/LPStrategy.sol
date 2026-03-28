// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BaseStrategy.sol";

/// @notice Simulates a liquidity pool — 14% APY, risk 9/10
contract LPStrategy is BaseStrategy {
    constructor(address _vault) BaseStrategy(_vault) {}

    function _apyBps() internal pure override returns (uint256) {
        return 1400;
    }

    function riskScore() external pure override returns (uint256) {
        return 9;
    }
}
