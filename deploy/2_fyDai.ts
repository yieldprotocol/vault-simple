import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const now = (await hre.ethers.provider.getBlock(await hre.ethers.provider.getBlockNumber())).timestamp
  const THREE_MONTHS = 3 * 30 * 24 * 60 * 60
  const daiAddress = (await hre.deployments.get('DaiMock')).address
  await hre.deployments.deploy('FYDai_1q', { from: deployer, contract: 'FYDai', args: [daiAddress, now + THREE_MONTHS, 'Dai', 'DAI'] })
  await hre.deployments.deploy('FYDai_2q', { from: deployer, contract: 'FYDai', args: [daiAddress, now + 2 * THREE_MONTHS, 'Dai', 'DAI'] })
  await hre.deployments.deploy('FYDai_3q', { from: deployer, contract: 'FYDai', args: [daiAddress, now + 3 * THREE_MONTHS, 'Dai', 'DAI'] })
  await hre.deployments.deploy('FYDai_4q', { from: deployer, contract: 'FYDai', args: [daiAddress, now + 4 * THREE_MONTHS, 'Dai', 'DAI'] })
};
export default func;

func.id = 'fyDai'
func.tags = ['FYDai'];