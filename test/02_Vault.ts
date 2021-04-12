import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import VaultArtifact from '../artifacts/contracts/Vault.sol/Vault.json'
import FYDaiArtifact from '../artifacts/contracts/FYDai.sol/FYDai.json'
import ERC20MockArtifact from '../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'
import RateOracleMockArtifact from '../artifacts/contracts/mocks/RateOracleMock.sol/RateOracleMock.json'
import SpotOracleMockArtifact from '../artifacts/contracts/mocks/SpotOracleMock.sol/SpotOracleMock.json'

import { FYDai } from '../typechain/FYDai'
import { Vault } from '../typechain/Vault'
import { ERC20Mock } from '../typechain/ERC20Mock'
import { RateOracleMock } from '../typechain/RateOracleMock'
import { SpotOracleMock } from '../typechain/SpotOracleMock'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
const { deployContract, loadFixture } = waffle

describe('Vault', function () {
  let ownerAcc: SignerWithAddress
  let userAcc: SignerWithAddress
  let owner: string
  let user: string
  let fyDai: FYDai
  let vault: Vault
  let dai: ERC20Mock
  let weth: ERC20Mock
  let rateOracle: RateOracleMock
  let spotOracle: SpotOracleMock
  let maturity: BigNumber

  const THREE_MONTHS = 3 * 30 * 24 * 60 * 60
  const WAD = BigNumber.from(10).pow(18)
  const RAY = BigNumber.from(10).pow(27)
  const SPOT = RAY.mul(2000) // 1 ETH ~ 2000 DAI
  const DAI_SPOT = WAD.div(BigNumber.from(2000)) // 1 DAI ~ 0.0005 ETH

  async function fixture() {
    const now = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
    maturity = BigNumber.from(now + THREE_MONTHS)

    rateOracle = (await deployContract(ownerAcc, RateOracleMockArtifact, [maturity])) as RateOracleMock
    spotOracle = (await deployContract(ownerAcc, SpotOracleMockArtifact, [])) as SpotOracleMock

    await spotOracle.setSpot(SPOT)

    dai = (await deployContract(ownerAcc, ERC20MockArtifact, ['Dai', 'DAI'])) as ERC20Mock
    weth = (await deployContract(ownerAcc, ERC20MockArtifact, ['Weth', 'WETH'])) as ERC20Mock
    fyDai = (await deployContract(ownerAcc, FYDaiArtifact, [dai.address, maturity, 'Dai', 'DAI'])) as FYDai

    await dai.mint(owner, WAD.mul(100))
    await weth.mint(user, WAD.mul(10))
    await fyDai.mint(owner, WAD.mul(100))

    await dai.mint(fyDai.address, WAD.mul(100))

    vault = (await deployContract(ownerAcc, VaultArtifact, [
      dai.address,
      weth.address,
      spotOracle.address,
      rateOracle.address,
      [fyDai.address],
    ])) as Vault
  }

  before(async () => {
    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    userAcc = signers[1]
    owner = await ownerAcc.getAddress()
    user = await userAcc.getAddress()
  })

  beforeEach(async () => {
    // loadFixture is a waffle feature that we use to load up the environment
    // After the first execution, the blockchain is snapshotted, speeding up tests
    // Incidentally, rolling back to the snapshot also rolls back in time
    await loadFixture(fixture)
  })

  it('user can get out of debt', async () => {
    // Sign your chains
    await weth.connect(userAcc).approve(vault.address, WAD)
    // Need some collateral to get started
    await vault.connect(userAcc).post(maturity, DAI_SPOT.mul(10)) // collateralize 10 DAI (in WETH)
    // Let's get bankrupt
    await vault.connect(userAcc).borrow(maturity, WAD.mul(10)) // borrow 10 DAI
    // Pay day
    await ethers.provider.send('evm_mine', [(await fyDai.maturity()).toNumber() + 10])
    // Still not out of debt
    await expect(vault.requireCollateralized(user, maturity)).to.be.revertedWith('Too much debt')
    // Repay debt (...somehow?)
    await vault.connect(userAcc).post(maturity, DAI_SPOT.mul(1)) // collateralize 1 DAI (in WETH)
    // Alas
    await vault.requireCollateralized(user, maturity)
  })
})
