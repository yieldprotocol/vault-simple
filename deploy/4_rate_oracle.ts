import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const fyDai_1qAddress = (await hre.deployments.get('FYDai_1q')).address
  const fyDai_1q = await hre.ethers.getContractAt('FYDai', fyDai_1qAddress)
  const f1Dai_1qMaturity = (await fyDai_1q.maturity()).toNumber()
  await hre.deployments.deploy('RateOracleMock', { from: deployer, contract: 'RateOracleMock', args: [f1Dai_1qMaturity] })
};
export default func;

func.id = 'rate_oracle'
func.tags = ['RateOracle'];