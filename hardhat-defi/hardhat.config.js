require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require('dotenv').config();
require('hardhat-deploy');

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
          chainId: 31337,
          forking: {
              url: MAINNET_RPC_URL,
          },
      },
    //   localhost: {
    //       chainId: 31337,
    //   },
      goerli: {
          url: GOERLI_RPC_URL,
          accounts: [`0x${PRIVATE_KEY}`],
          chainId: 5,
          blockConfirmations: 6,
      },
  },
  solidity: {
      compilers: [
          {
              version: "0.8.8",
          },
          {
              version: "0.6.12",
          },
          {
            version: "0.6.6",
        },
          {
              version: "0.4.19",
          },
      ],
  },
  etherscan: {
      apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
      enabled: true,
      currency: "USD",
      outputFile: "gas-report.txt",
      noColors: true,
      coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
      deployer: {
          default: 0, // here this will by default take the first account as deployer
          1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
      },
  },
}