import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  await hre.deployments.deploy('DaiMock', { from: deployer, contract: 'ERC20Mock', args: ['DaiMock', 'DAI'] })
};
export default func;

func.id = 'dai_mock'
func.tags = ['DaiMock'];