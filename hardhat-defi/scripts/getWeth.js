const {ethers, getNamedAccounts, network} = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth(){
  const {deployer} = await getNamedAccounts();
  //we need abi and contract address - 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
  const iWeth = await ethers.getContractAt("IWeth", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", deployer);
  const tx = await iWeth.deposit({value: AMOUNT});
  await tx.wait(1);
  const wethBalance = await iWeth.balanceOf(deployer);

  console.log(`Get ${wethBalance.toString()} Weth!!`)
}

module.exports = {getWeth, AMOUNT};
