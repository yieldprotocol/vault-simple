import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import FYDaiArtifact from '../artifacts/contracts/FYDai.sol/FYDai.json'
import ERC20MockArtifact from '../artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json'

import { FYDai } from '../typechain/FYDai'
import { ERC20Mock } from '../typechain/ERC20Mock'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
const { deployContract, loadFixture } = waffle

describe('FYDai', function () {
  let ownerAcc: SignerWithAddress
  let owner: string
  let fyDai: FYDai
  let dai: ERC20Mock

  const THREE_MONTHS = 3 * 30 * 24 * 60 * 60
  const WAD = BigNumber.from(10).pow(18)

  async function fixture() {
    const now = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp

    dai = (await deployContract(ownerAcc, ERC20MockArtifact, ['Dai', 'DAI'])) as ERC20Mock
    fyDai = (await deployContract(ownerAcc, FYDaiArtifact, [dai.address, now + THREE_MONTHS, 'Dai', 'DAI'])) as FYDai

    await dai.mint(owner, WAD.mul(100))
    await fyDai.mint(owner, WAD.mul(100))

    await dai.mint(fyDai.address, WAD.mul(100))
  }

  before(async () => {
    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()
  })

  beforeEach(async () => {
    // loadFixture is a waffle feature that we use to load up the environment
    // After the first execution, the blockchain is snapshotted, speeding up tests
    // Incidentally, rolling back to the snapshot also rolls back in time
    await loadFixture(fixture)
  })

  it('is not mature before maturity', async () => {
    expect(await fyDai.isMature()).to.be.false
  })

  it('does not allow to redeem before maturity', async () => {
    await expect(fyDai.redeem(WAD)).to.be.revertedWith('Not mature')
  })

  // TODO: Test mint and burn

  describe('after maturity', async () => {

    let now: Number

    beforeEach(async () => {
      now = await ethers.provider.send('evm_snapshot', [])
      await ethers.provider.send('evm_mine', [(await fyDai.maturity()).toNumber()])
    })

    afterEach(async () => {
      await ethers.provider.send('evm_revert', [now])
    })

    it('redeems fyDai for Dai', async () => {
      const daiOwnerBefore = await dai.balanceOf(owner)
      const fyDaiOwnerBefore = await fyDai.balanceOf(owner)

      await expect(fyDai.redeem(WAD)).to.emit(fyDai, 'Redeemed').withArgs(owner, WAD)
      expect(await dai.balanceOf(owner)).to.equal(daiOwnerBefore.add(WAD))
      expect(await fyDai.balanceOf(owner)).to.equal(fyDaiOwnerBefore.sub(WAD))
    })
  })
})
