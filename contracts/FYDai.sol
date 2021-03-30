// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@yield-protocol/utils/contracts/token/ERC20.sol";
import "@yield-protocol/utils/contracts/token/IERC20.sol";
import "./interfaces/IFYDai.sol";


contract FYDai is IFYDai, ERC20 {
    event Redeemed(address user, uint256 amount);

    IERC20 public dai;
    uint256 public override maturity;
    
    /// @dev Set with Dai contract, maturity date, name and symbol
    constructor(
        IERC20 dai_,
        uint256 maturity_,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        dai = dai_;
        maturity = maturity_;
    }

    /// @dev Whether this fyDai has matured
    function isMature() public view override returns (bool) {
        return block.timestamp > maturity;
    }

    /// @dev Mint fyDai
    // TODO: Restrict access to Vault contract
    function mint(address to, uint256 amount) public override {
        _mint(to, amount);
    }

    /// @dev Burn fyDai
    // TODO: Restrict access to Vault contract
    function burn(address from, uint256 amount) public override {
        _burn(from, amount);
    }

    /// @dev After maturity, exchange fyDai for Dai at a 1:1 exchange rate
    function redeem(uint256 amount) public override {
        require(
            isMature(),
            "Not mature"
        );
        _burn(msg.sender, amount);
        dai.transfer(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }
}
