require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require('hardhat-deploy');
require("dotenv").config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "http:/" ;
const PRIVATE_KEY = process.env.PRIVATE_KEY || "unvalid" ;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key" ;
const COIN_API_KEY = process.env.COIN_API_KEY || "key" ;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",

  //if we want to delpoy to another testnet, we will have to add the network detail in hardhat.config files like below:
  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts:[`0x${PRIVATE_KEY}`],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COIN_API_KEY,
    token: "ETH",
  },

  solidity: {
    compilers:[{version: "0.8.8"}, {version: "0.6.6"}],
  },
  namedAccounts:{
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, 
      // similarly on mainnet it will take the first account as deployer.
      //Note though that depending on how hardhat network are configured, 
      //the account 0 on one network can be different than on another * /
    },
  }
}