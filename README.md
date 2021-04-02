# vault-simple
Simple version of the Yield Vault for candidate assessment purposes

FYTokens are ERC20 tokens that at maturity can be redeemed for their underlying. At maturity, one fyDai can be redeemed (burned) for 1 Dai.

Vault allows to deposit (`post`) an ERC20 (WETH) as collateral, in order to `borrow` a fyToken (fyDai). The borrowing power is determined by an oracle that returns the spot price for the DAI/WETH pair.

`borrowing power in fyDAI = collateral in WETH * DAI/WETH price`

The debt of an user in DAI terms is equal to their fyDAI debt before maturity. After maturity, the debt in DAI terms increases according to the DAI borrowing rate increase from a lender such as MakerDAO.

`debt in DAI = before maturity ? fyDAI debt : fyDai debt * rate`

The fyDAI debt of an user can be repaid with both fyDAI (`repay`) or DAI (`repayDai`).

