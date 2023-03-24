// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
//pragma version

//imports
import "./PriceConverter.sol";

//error messages
error FundMe__NotOwner();

//interfaces, libraries, contracts

/** @title A contract for crowd funding
 *  @author BlockHunt
 *  @notice This contract is to demo a sample funding contract
 *  @dev  This implement price feeds as our library
 */

contract FundMe {
    //type Declarations
    using PriceConverter for uint256;

    //State Variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // Could we make this constant?
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed;
    // Events (we have none!)
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /**
     *  @notice This function funds the contract
     *  @dev  This function allows users to fund
     */

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function getFundersAmount(address _funders) public view returns (uint256) {
        return s_addressToAmountFunded[_funders];
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// Functions Order:
//// constructor
//// receive
//// fallback
//// external
//// public
//// internal
//// private
//// view / pure
