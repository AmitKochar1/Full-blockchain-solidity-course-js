const {deployments, ethers, getNamedAccounts, network} = require("hardhat");
const {assert, expect} = require("chai");
const {developmentChains} = require("../../helper-hardhat-config")


!developmentChains.includes(network.name) 
    ? describe.skip : 
    describe("FundMe", async function() {
        let fundMe, deployer, MockV3Aggregator;

        const sendValue = ethers.utils.parseEther("1");

        beforeEach(async function(){
            //deploy our fundMe contract
            //using hardhat-deploy
            // const accounts = await ethers.getSigners();
            // const accountZero = accounts[0];
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture("all");
            fundMe = await ethers.getContract("FundMe", deployer);
            MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        })
        describe("constructor", async function() {
            it("Set the aggregator addresses correctly", async function (){
                const response = await fundMe.getPriceFeed();
                assert.equal(response, MockV3Aggregator.address) ;
            })
        })

        describe("fund", async function() {
            it("fails if you dont send enouh ETH", async function(){
                await expect(fundMe.fund()).to.be.reverted;
            })

            it("updates the amount funded data structure", async function() {
                await fundMe.fund({value: sendValue});
                //console.log(deployer.address)
                const response = await fundMe.getFundersAmount(deployer);
                assert.equal(response.toString(), sendValue.toString());
                //console.log(deployer)
            })

            it("check getFunder array", async function() {
                await fundMe.fund({value: sendValue});
                const response = await fundMe.getFunder(0);
                assert.equal(response, deployer);
            })
        })

        describe("Withdraw", async function(){
            beforeEach(async function(){
                await fundMe.fund({value: sendValue});
            })

            it("withdraw eth form a founder", async function(){
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const StartingDeployerBalance = await fundMe.provider.getBalance(deployer);
                //console.log(startingFundMeBalance.toString(), StartingDeployerBalance.toString());
                
                //Act
                const tx = await fundMe.withdraw();
                const txWait = await tx.wait(1);
                const{gasUsed, effectiveGasPrice} = txWait;
                const totalGasCost = gasUsed.mul(effectiveGasPrice);
                //console.log(totalGasCost.toString());

                const endFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endDeployerBalance = await fundMe.provider.getBalance(deployer);

                //assert
                assert.equal(endFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(StartingDeployerBalance).toString(), endDeployerBalance.add(totalGasCost).toString());

            })

            it("Multiple accounts withdrawing funds", async function() {
                //Arrange
                const accounts = await ethers.getSigners();
                for (let i =1; i < 5; i++){
                    let fundMeConnectedContract = await fundMe.connect( accounts[i]);
                    await fundMeConnectedContract.fund({value: sendValue});
                }

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const StartingDeployerBalance = await fundMe.provider.getBalance(deployer);
                
                //Act
                const tx = await fundMe.withdraw();
                const txWait = await tx.wait(1);
                const{gasUsed, effectiveGasPrice} = txWait;
                const totalGasCost = gasUsed.mul(effectiveGasPrice);

                const endFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endDeployerBalance = await fundMe.provider.getBalance(deployer);
                
                //assert
                assert.equal(endFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(StartingDeployerBalance).toString(), endDeployerBalance.add(totalGasCost).toString());

                //Make sure that the getFunder are rest properly
                expect(fundMe.getFunder(0)).to.be.reverted;
                
                for (i =1; i <6; i++){
                    assert.equal(await fundMe.getFundersAmount(accounts[i].address), 0);
                }
            })

            it("only allows owners to withdraw", async function() {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1];
                const attackerConnectContract = await fundMe.connect(attacker);
                //console.log(attackerConnectContract.address)
                await expect(attackerConnectContract.withdraw()).to.be.reverted;
        })

        it("Cheaper withdraw testing.....", async function() {
            //Arrange
            const accounts = await ethers.getSigners();
            for (let i =1; i < 5; i++){
                let fundMeConnectedContract = await fundMe.connect( accounts[i]);
                await fundMeConnectedContract.fund({value: sendValue});
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const StartingDeployerBalance = await fundMe.provider.getBalance(deployer);
            
            //Act
            const tx = await fundMe.cheaperWithdraw();
            const txWait = await tx.wait(1);
            const{gasUsed, effectiveGasPrice} = txWait;
            const totalGasCost = gasUsed.mul(effectiveGasPrice);

            const endFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endDeployerBalance = await fundMe.provider.getBalance(deployer);
            
            //assert
            assert.equal(endFundMeBalance, 0);
            assert.equal(startingFundMeBalance.add(StartingDeployerBalance).toString(), endDeployerBalance.add(totalGasCost).toString());

            //Make sure that the getFunder are rest properly
            expect(fundMe.getFunder(0)).to.be.reverted;
            
            for (i =1; i <6; i++){
                assert.equal(await fundMe.getFundersAmount(accounts[i].address), 0);
            }
        })
        })
    })
