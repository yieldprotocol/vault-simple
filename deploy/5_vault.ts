import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const daiMockAddress = (await hre.deployments.get('DaiMock')).address
  const wethMockAddress = (await hre.deployments.get('WethMock')).address
  const fyDai_1qAddress = (await hre.deployments.get('FYDai_1q')).address
  const fyDai_2qAddress = (await hre.deployments.get('FYDai_2q')).address
  const fyDai_3qAddress = (await hre.deployments.get('FYDai_3q')).address
  const fyDai_4qAddress = (await hre.deployments.get('FYDai_4q')).address
  const spotOracleAddress = (await hre.deployments.get('SpotOracleMock')).address
  const rateOracleAddress = (await hre.deployments.get('RateOracleMock')).address
  await hre.deployments.deploy('Vault', { from: deployer, contract: 'Vault', args: [daiMockAddress, wethMockAddress, spotOracleAddress, rateOracleAddress, [fyDai_1qAddress, fyDai_2qAddress, fyDai_3qAddress, fyDai_4qAddress]] })
};
export default func;

func.id = 'vault'
func.tags = ['Vault'];