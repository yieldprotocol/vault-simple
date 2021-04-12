// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;
import "../interfaces/ISpotOracle.sol";


contract SpotOracleMock is ISpotOracle {
    uint256 public override spot;

    constructor () { }

    function setSpot(uint256 spot_) public {
        spot = spot_;
    }
}
