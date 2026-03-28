// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IStrategy.sol";

/// @title BaseStrategy
/// @notice Mock strategy that simulates yield accrual based on blocks elapsed.
///         Each strategy has a different APY and risk score.
abstract contract BaseStrategy is IStrategy {
    address public immutable vault;
    uint256 public principal;
    uint256 public lastHarvestBlock;

    modifier onlyVault() {
        require(msg.sender == vault, "only vault");
        _;
    }

    constructor(address _vault) {
        vault = _vault;
        lastHarvestBlock = block.number;
    }

    function deposit() external payable override onlyVault {
        principal += msg.value;
    }

    function withdraw(uint256 amount) external override onlyVault {
        require(amount <= address(this).balance, "insufficient balance");
        principal = principal > amount ? principal - amount : 0;
        (bool ok, ) = vault.call{value: amount}("");
        require(ok, "transfer failed");
    }

    function harvest() external override onlyVault {
        uint256 yield_ = _pendingYield();
        lastHarvestBlock = block.number;
        if (yield_ > 0) {
            // Mint simulated yield by keeping it in the contract balance
            // In a real protocol this would come from the underlying protocol
            principal += yield_;
        }
    }

    function totalBalance() external view override returns (uint256) {
        return principal + _pendingYield();
    }

    /// @dev Override this in each strategy to set the APY
    function _apyBps() internal pure virtual returns (uint256);

    function apyBps() external pure override returns (uint256) {
        return _apyBps();
    }

    function _pendingYield() internal view returns (uint256) {
        if (principal == 0) return 0;
        uint256 blocksDelta = block.number - lastHarvestBlock;
        // Simulate ~1 block per second, ~31.5M blocks per year
        // yield = principal * apyBps / 10000 * blocksDelta / blocksPerYear
        return (principal * _apyBps() * blocksDelta) / (10000 * 31_536_000);
    }
}
