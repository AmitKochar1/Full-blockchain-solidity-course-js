const {getWeth, AMOUNT} = require("../scripts/getWeth.js")
const {ethers, getNamedAccounts, network} = require("hardhat");

async function main(){
    await getWeth();
    const {deployer} = await getNamedAccounts();
    //Lending pool
    const lendingPool = await getLandingPool(deployer);
    console.log(`Lending pool address: ${lendingPool.address}`);

    //deposit, approve aave contract first
    const wethTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    //approve
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("deposited...")

    //AvailableBorrowETH?? what the conversion rate on DAI?

    //borrow settings
    let {availableBorrowsETH, totalDebtETH} = await getBorrowUserData(lendingPool, deployer);
    const daiPrice = await getDaiPrice();
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);

    const amountDaiToBorrowWei = await ethers.utils.parseEther(amountDaiToBorrow.toString());
    console.log(`Dai in wei ${amountDaiToBorrowWei.toString()}`);

    //Borrow
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer);
    await getBorrowUserData(lendingPool, deployer);

    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);
    await getBorrowUserData(lendingPool, deployer);
}

async function getDaiPrice(){
    //DAI/ETH - address - 0x773616E4d11A78F511299002da57A0a94577F1f4
    const daiEthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4");
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`);
    return price;
}

async function getBorrowUserData(lendingPool, account){
    const {totalCollateralETH, totalDebtETH, availableBorrowsETH} = await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited!`);
    console.log(`You have ${totalDebtETH} worth of ETH debt!`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH!`);
    //return{totalDebtETH, availableBorrowsETH};
    return{availableBorrowsETH, totalDebtETH};
}

async function getLandingPool(account){
    //Lending Pool address provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5;

    const landingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account);
    const lendingPoolAddress = await landingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt("ILendingPool",lendingPoolAddress, account)
    return lendingPool;
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account){
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account);
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved!!");
}

async function borrowDai(daiAddress, lendingPool, amountToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountToBorrowWei, 1, 0, account);
    await borrowTx.wait(1);
    console.log("You have borrowed!")

}

async function repay(amount, daiAddress, lendingPool, account){
    await approveErc20(daiAddress, lendingPool.address, amount, account);
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
    await repayTx.wait(1);
    console.log("Repaid");
}


main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
