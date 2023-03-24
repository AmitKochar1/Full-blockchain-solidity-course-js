const {network, ethers, getNamedAccounts} = require("hardhat");
const {developmentChains} = require("../../helper-hardhat-config")
const {assert, expect} = require("chai");


developmentChains.includes(network.name) 
    ? describe.skip : 
    describe("FundMe", async function() {
        let fundMe, deployer;

        const sendValue = ethers.utils.parseEther("1");

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer;
            fundMe = await ethers.getContract("FundMe", deployer);
        })

        it("Allows value to fund and withdraw", async function(){
            await fundMe.fund({value: sendValue});
            await fundMe.withdraw();
            const endingBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            assert.equal(endingBalance.toString(), "0");
        })

    })