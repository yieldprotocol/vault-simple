// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;


interface ISpotOracle {
    /// @dev This is the spot market price to exchange between two tokens.
    /// @return Fixed point with 27 decimals (RAY).
    function spot() external view returns(uint256);
}
