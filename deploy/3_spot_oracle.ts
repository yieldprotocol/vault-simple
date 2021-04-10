import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const spotOracleAddress = (await hre.deployments.deploy('SpotOracleMock', { from: deployer, contract: 'SpotOracleMock' })).address
  const spotOracle = await hre.ethers.getContractAt('SpotOracleMock', spotOracleAddress)
  await spotOracle.setSpot(2000)
}
export default func

func.id = 'spot_oracle'
func.tags = ['SpotOracle']