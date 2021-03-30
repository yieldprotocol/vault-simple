// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@yield-protocol/utils/contracts/token/IERC20.sol";


interface IFYDai is IERC20 {
    /// @dev Unix time at which this series matures
    function maturity() external view returns(uint256);

    /// @dev Whether this fyDai has matured
    function isMature() external view returns(bool);

    /// @dev Mint fyDai
    function mint(address, uint256) external;

    /// @dev Burn fyDai
    function burn(address, uint256) external;

    /// @dev After maturity, exchange fyDai for Dai at a 1:1 exchange rate
    function redeem(uint256) external;
}