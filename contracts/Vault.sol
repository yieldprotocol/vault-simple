// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@yield-protocol/utils/contracts/token/IERC20.sol";
import "./BoringBatchable.sol";
import "./interfaces/IFYDai.sol";
import "./interfaces/ISpotOracle.sol";
import "./interfaces/IRateOracle.sol";


library DecimalMath {
    function muld(uint256 x, uint256 y) internal pure returns (uint256) {
        return x * y / 1e27;
    }
}

library SafeCast {
    function i256(uint256 x) internal pure returns (int256) {
        require (x <= uint256(type(int256).max), "Cast overflow");
        return int256(x);
    }
}

contract Vault is BoringBatchable {
    using DecimalMath for uint256;
    using SafeCast for uint256;

    event Posted(address indexed user, int256 amount);
    event Borrowed(uint256 indexed maturity, address indexed user, int256 amount);

    IERC20 public dai;
    IERC20 public weth;
    ISpotOracle public spotOracle;
    IRateOracle public rateOracle;

    mapping(uint256 => IFYDai) public series;                              // FYDai series, indexed by maturity date
    mapping(address => mapping(uint256 => uint256)) public posted;         // Collateral posted by each user, by series
    mapping(address => mapping(uint256 => uint256)) public debt;           // Debt owed by each user, by series

    /// @dev Set up dai, weth, dai/weth oracle and fyDai series.
    constructor (
        IERC20 dai_,
        IERC20 weth_,
        ISpotOracle spotOracle_,
        IRateOracle rateOracle_,
        IFYDai[] memory fyDais

    ) {
        spotOracle = spotOracle_;
        rateOracle = rateOracle_;
        dai = dai_;
        weth = weth_;
        for (uint256 i = 0; i < fyDais.length; i += 1) {
            series[fyDais[i].maturity()] = fyDais[i];
        }
    }

    /// @dev Require that a series exists for the given maturity
    modifier validSeries(uint256 maturity) {
        require (
            series[maturity] != IFYDai(address(0)),
            "Series not found"
        );
        _;
    }

    /// @dev Require that the user has posted enough collateral for its debt of a given maturity
    function requireCollateralized(address user, uint256 maturity) public view {
        require(
            powerOf(maturity, user) >= debtDai(maturity, user),
            "Too much debt"
        );
    }

    /// @dev The debt of a user grows in dai terms after maturity according to the rate oracle
    function debtDai(uint256 maturity, address user) public view returns (uint256) {
        IFYDai fyDai = series[maturity];
        if (fyDai.isMature()) return debt[user][maturity].muld(rateOracle.rateGrowth());
        else return debt[user][maturity];
    }

    /// @dev The borrowing power of a user is determined by the posted collateral and the spot price
    function powerOf(uint256 maturity, address user) public view returns (uint256) {
        // dai = price * collateral
        return posted[user][maturity].muld(spotOracle.spot());
    }

    /// @dev Post weth collateral
    function post(uint256 maturity, uint256 wethAmount)
        public 
    {
        posted[msg.sender][maturity] = posted[msg.sender][maturity] + wethAmount;
        weth.transferFrom(msg.sender, address(this), wethAmount);
        emit Posted(msg.sender, wethAmount.i256());
    }

    /// @dev Withdraw weth collateral, posted before
    function withdraw(uint256 maturity, uint256 wethAmount)
        public
    {
        posted[msg.sender][maturity] = posted[msg.sender][maturity] - wethAmount; // Will revert if not enough posted
        requireCollateralized(msg.sender, maturity);
        weth.transfer(msg.sender, wethAmount);
        emit Posted(msg.sender, -(wethAmount.i256()));
    }

    /// @dev Borrow fyDai of a given maturity
    function borrow(uint256 maturity, uint256 fyDaiAmount)
        public
        validSeries(maturity)
    {
        IFYDai fyDai = series[maturity];
        debt[msg.sender][maturity] = debt[msg.sender][maturity] + fyDaiAmount;
        requireCollateralized(msg.sender, maturity);
        fyDai.mint(msg.sender, fyDaiAmount);
        emit Borrowed(maturity, msg.sender, fyDaiAmount.i256());
    }

    /// @dev Repay fyDai debt of a given maturity
    function repay(uint256 maturity, uint256 fyDaiAmount)
        public
        validSeries(maturity)
    {
        debt[msg.sender][maturity] = debt[msg.sender][maturity] - fyDaiAmount;
        series[maturity].burn(msg.sender, fyDaiAmount);

        emit Borrowed(maturity, msg.sender, -(fyDaiAmount.i256()));
    }

    /// @dev Repay fyDai debt, using Dai.
    /// Before maturity, we accept a 1:1 exchange rate between any fyDai and Dai
    /// After maturity, paying with Dai incurs a penalty according to the oracle rate
    function repayDai(uint256 maturity, uint256 fyDaiAmount)
        public
        validSeries(maturity)
    {
        IFYDai fyDai = series[maturity];
        uint256 daiAmount = fyDai.isMature() ? fyDaiAmount.muld(rateOracle.rateGrowth()) : fyDaiAmount;
        
        debt[msg.sender][maturity] = debt[msg.sender][maturity] - fyDaiAmount;
        dai.transferFrom(msg.sender, address(this), daiAmount);

        emit Borrowed(maturity, msg.sender, -(fyDaiAmount.i256()));
    }
}
