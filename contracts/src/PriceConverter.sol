// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "@chainlink/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    /**
     * @notice 获取 ETH/USD 的最新价格
     * @param priceFeed Chainlink 预言机接口地址
     * @return 最新价格（以 18 位小数返回）
     */
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // 从预言机获取最新轮次的交易数据
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        
        // Chainlink 的价格通常是 8 位小数，需要转换为 18 位小数以匹配 ETH
        return uint256(answer * 1e10);
    }

    /**
     * @notice 将 ETH 金额（以 wei 为单位）转换为等值的 USD 金额
     * @param ethAmount 要转换的 ETH 数量（单位：wei）
     * @param priceFeed Chainlink 预言机接口地址
     * @return 等值的 USD 金额（单位：wei，18 位小数）
     */
    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // 获取当前 ETH/USD 价格
        uint256 ethPrice = getPrice(priceFeed);
        
        // 计算等值美元金额
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        
        return ethAmountInUsd;
    }

    /**
     * @notice 返回预言机的版本号
     * @param priceFeed Chainlink 预言机接口地址
     * @return 版本号
     */
    function getVersion(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        return priceFeed.version();
    }
}