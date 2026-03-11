pragma solidity ^0.8.33;
import {MockV3Aggregator} from "@chainlink/src/v0.8/shared/mocks/MockV3Aggregator.sol";
import {Script} from "forge-std/Script.sol";
import {FundMe} from "../src/FundMe.sol";

contract DeployFundMe is Script {
    function run() external returns (FundMe) {
        vm.startBroadcast();
        
        // 如果在 Anvil 上，部署 Mock 价格预言机
        MockV3Aggregator mockPriceFeed = new MockV3Aggregator(
            8,  // 小数位数
            2000 * 10**8  // 初始价格：$2000
        );
        
        // 用 Mock 地址部署 FundMe
        FundMe fundMe = new FundMe(address(mockPriceFeed));
        
        vm.stopBroadcast();
        return fundMe;
    }
}