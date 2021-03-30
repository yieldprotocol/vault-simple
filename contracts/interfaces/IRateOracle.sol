// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;


interface IRateOracle {
    /// @dev This is the accumulated change in rate since maturity.
    /// @return rate(now)/rate(maturity), in fixed point with 27 decimals (RAY).
    function rateGrowth() external view returns(uint256);
    function maturity() external view returns(uint256);
}
