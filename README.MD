Solidity和Dapp学习笔记和练习，作为理解区块链的基础
1. 启动本地以太坊网络
anvil --state fundme-anvil.json  
2. 部署FundMe合约
调用DeployFundMe这个script来部署FundMe合约
forge script script/DeployFundMe.sol:DeployFundMe --rpc-url http://localhost:8545 --broadcast --private-key <你的私钥>
在另一个终端验证（MINIMUM_USD是FundeMe合约中的函数）：
cast call <合约地址> "MINIMUM_USD()(uint256)" --rpc-url http://localhost:8545
3. 运行Dapp
在终端运行pnpm vite开发服务器，它即时将 TypeScript 代码编译成 JavaScript，随即在浏览器中打开[index.html](http://127.0.0.1:5173/frontend/index.html)