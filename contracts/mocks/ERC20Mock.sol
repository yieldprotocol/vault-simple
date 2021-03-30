// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@yield-protocol/utils/contracts/token/ERC20.sol";


contract ERC20Mock is ERC20 {
    constructor (string memory name, string memory symbol)
        ERC20(name, symbol) {
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
