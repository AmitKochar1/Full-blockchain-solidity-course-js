const {network, ethers} = require("hardhat");
const {developmentChains} = require('../helper-hardhat-config');

module.exports = async function({getNamedAccounts, deployments}){
    const{deploy, log} = deployments;
    const{deployer} = await getNamedAccounts();

    const BASE_FEE = ethers.utils.parseEther("0.25");
    const GAS_PRICE_LINK = 11e9;

    const args = [BASE_FEE, GAS_PRICE_LINK];

    if(developmentChains.includes(network.name)){ 
        log("Local network detected, deploying mock....");
        const mockContract = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
        })

        log("Mock deployed...");
        log("------------------");
    }
}

module.exports.tags = ["all", "mocks"];