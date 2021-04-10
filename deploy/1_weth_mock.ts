import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  await hre.deployments.deploy('WethMock', { from: deployer, contract: 'ERC20Mock', args: ['WethMock', 'WETH'] })
};
export default func;

func.id = 'weth_mock'
func.tags = ['WethMock'];