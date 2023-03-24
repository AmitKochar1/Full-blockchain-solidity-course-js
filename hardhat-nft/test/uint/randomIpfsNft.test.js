const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random NFT Unit Tests", function () {
        let randomIpfsNft, deployer, vrfCoordinatorV2Mock;

        beforeEach(async () => {
            accounts = await ethers.getSigners();
            deployer = accounts[0];
            await deployments.fixture([ "mocks", "randomipfs"]);
            randomIpfsNft = await ethers.getContract("RandomIpfsNft");
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        }) 

        describe("Constructor", () => {
            it("Setting value to constructor", async() => {
                const dogToken = await randomIpfsNft.getDogTokenUris(0);
                assert(dogToken.includes("ipfs://"));
                const  isInitialized = await randomIpfsNft.getInitialized();
                assert(isInitialized, true);
            })
        })

        describe("request NFT", () =>{
            it("Fails if payment is no sent with the request", async () =>{
                await expect(randomIpfsNft.requestNft()).to.be.reverted;
            })
            it("Request if the payment is less then mint fee", async() => {
                const notEnoughFee = ethers.utils.parseEther(".009");
                const mintFee = await randomIpfsNft.getMintFee();
                //console.log(mintFee.toString());
                await expect(randomIpfsNft.requestNft({value: notEnoughFee})).to.be.reverted;
            })

            it("emits an event and kicks off a random word request", async() => {
                const fee = await randomIpfsNft.getMintFee();
                expect(randomIpfsNft.requestNft({value: fee.toString()})).to.emit( randomIpfsNft, "NftRequested");
            })
        })

        // describe("fulfillRandomWords", async () => {
        //     let mintFee, tx;
        //     beforeEach(async () => {
        //         mintFee = await randomIpfsNft.getMintFee();
        //         tx = await randomIpfsNft.requestNft({ value: mintFee });
        //     })
        //     it("_safeMint", async () => {
        //         const txReceipt = await tx.wait(1)
        //         const requestId = txReceipt.events[1].args.requestId
        //         const dogOwner = await randomIpfsNft.s_requestIdToSender[requestId]
        //         const newTokenId = await randomIpfsNft.getTokenCounter()
        //         await expect(randomIpfsNft.fulfillRandomWords()._safeMint(dogOwner, newTokenId))
        //     })
        //     it("Should emit the NftMinted event", async () => {
        //         //fulfillRandomWords(mocks being chainlink vrf)
        //         //We will have to wait for fulfillRandomWorgs to be called
        //         await new Promise(async (resolve, reject) => {
        //             randomIpfsNft.once("NftMinted", async () => {
        //                 console.log("Found the event")
        //                 resolve()
        //                 try {
        //                     const requestId = txReceipt.events[1].args.requestId
        //                     const dogBreed = await randomIpfsNft.getBreedFromModdedRng({ value: 25 })
        //                     const dogOwner = await randomIpfsNft.s_requestIdToSender[requestId]
        //                     assert.equal(dogOwner, msg.sender)
        //                     assert.equal(dogBreed.toString(), "SHIBA_INU")
        //                 } catch (e) {
        //                     reject()
        //                 }
        //             })
        //             //Setting up the listener
        //             //below we will fire the event, the listener will pick it up and resolve
        //             const tx = await randomIpfsNft.requestNft([])
        //             const txReceipt = await tx.wait(1)
        //             await vrfCoordinatorV2Mock.fulfillRandomWords(
        //                 txReceipt.events[0].args.requestId,
        //                 randomIpfsNft.address
        //             )
        //         })
        //     })
        // })

        describe("fulfillRandomWords", () => {
            it("mints NFT after random number is returned", async function () {
                await new Promise(async (resolve, reject) => {
                    randomIpfsNft.once("NftMinted", async () => {
                        try {
                            const tokenUri = await randomIpfsNft.tokenURI("0")
                            const tokenCounter = await randomIpfsNft.getTokenCounter()
                            assert.equal(tokenUri.toString().includes("ipfs://"), true)
                            assert.equal(tokenCounter.toString(), "0")
                            resolve()
                        } catch (e) {
                            console.log(e)
                            reject(e)
                        }
                    })
                    try {
                        const fee = await randomIpfsNft.getMintFee()
                        const requestNftResponse = await randomIpfsNft.requestNft({
                            value: fee.toString(),
                        })
                        const requestNftReceipt = await requestNftResponse.wait(1)
                        await vrfCoordinatorV2Mock.fulfillRandomWords(
                            requestNftReceipt.events[1].args.requestId,
                            randomIpfsNft.address
                        )
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                })
            })
        })
        
})