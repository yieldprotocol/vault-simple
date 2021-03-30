// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;
import "../interfaces/IRateOracle.sol";
import "./SpotOracleMock.sol";


contract RateOracleMock is IRateOracle, SpotOracleMock() {
    uint256 public immutable override maturity;

    constructor (uint256 maturity_) {
        maturity = maturity_;
    }

    function rateGrowth() public view override returns(uint256) {
        if (block.timestamp > maturity) return 105e25;
        else return 1e27;
    }
}
