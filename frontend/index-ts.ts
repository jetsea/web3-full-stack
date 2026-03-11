import { createWalletClient, custom, createPublicClient, parseEther, formatEther, WalletClient, PublicClient, Chain, Hex } from "viem";
import "viem/window";
// 类型定义
interface ContractFunctionArgs {
  value?: bigint;
  [key: string]: any;
}

// DOM 元素
const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;
const searchButton = document.getElementById("searchButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;

// 全局变量
let walletClient: WalletClient | undefined;
let publicClient: PublicClient | undefined;
let fundMeABI: any;

// Anvil 链配置
const anvilChain: Chain = {
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
};

// 加载合约 ABI
async function loadABI(): Promise<void> {
  try {
    const response = await fetch('../out/FundMe.sol/FundMe.json');
    const contractJson = await response.json();
    fundMeABI = contractJson.abi;
    console.log('ABI 加载成功');
  } catch (error) {
    console.error('ABI 加载失败:', error);
  }
}

// 连接钱包
async function connect(): Promise<void> {
  // 检查 MetaMask 提供者是否可用
  if (typeof window.ethereum !== "undefined") {
    console.log("检测到 MetaMask 已安装！");

    try {
      // 创建钱包客户端
      walletClient = createWalletClient({
        chain: anvilChain,
        transport: custom(window.ethereum),
      });

      // 请求访问用户的账户
      await walletClient.requestAddresses();

      // 更新界面以表示连接成功
      connectButton.innerHTML = "已连接！";

    } catch (error) {
      // 处理连接过程中可能出现的错误
      console.error("连接失败:", error);
      connectButton.innerHTML = "连接失败";
    }

  } else {
    // 如果未检测到 MetaMask，更新界面提示
    connectButton.innerHTML = "请安装 MetaMask！";
  }
}

// 执行合约函数
async function executeContractFunction(functionName: string, args: ContractFunctionArgs = {}): Promise<Hex> {
  // 确保钱包已连接，客户端已初始化
  if (typeof window.ethereum !== "undefined") {
    // 重新初始化或确认 walletClient
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    // 请求账户访问权限
    const [address] = await walletClient.requestAddresses();
    console.log("钱包已连接，账户:", address);

    // 在 Wallet Client 就绪后创建 Public Client
    publicClient = createPublicClient({
         transport: custom(window.ethereum)
    });
    console.log("Public Client 已初始化");
    
    try {
      console.log("尝试模拟...");
      const result = await publicClient.simulateContract({
        address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // 智能合约地址
        abi: fundMeABI,     // 使用加载的合约 ABI
        functionName: functionName,
        account: address,   // 使用从 requestAddresses 获得的地址
        ...args, // 传递额外参数，如 value
      });
      
      const gasEstimate = await publicClient.estimateContractGas({
        address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        abi: fundMeABI,
        functionName: functionName,
        account: address,
        ...args,
      });
      
      console.log("模拟成功:", result);
      console.log("预计 Gas 费用:", gasEstimate);
      
      const hash = await walletClient.writeContract({
        ...result.request,
        chain: anvilChain,  // 显式指定 chain
      });
      
      console.log("交易已发送，哈希:", hash);
      return hash;
    } catch (error) {
      console.error(`执行 ${functionName} 时出错:`, error);
      throw error;
    }
  } else {
    // 处理 MetaMask（或其他提供者）未安装的情况
    console.log("请安装 MetaMask！");
    throw new Error("MetaMask 未安装");
  }
}

// 注入资金
async function fund(): Promise<void> {
  const ethAmount = ethAmountInput.value;
  const value = parseEther(ethAmount);
  console.log(`正在注入 ${ethAmount} ETH...`);

  try {
    await executeContractFunction('fund', { value: value });
  } catch (error) {
    console.error("注入资金失败:", error);
  }
}

// 获取余额
async function getBalance(): Promise<void> {
  // 检查浏览器以太坊提供者（如 MetaMask）是否可用
  if (typeof window.ethereum !== "undefined") {
    // 使用 viem 创建一个 Public Client
    // 此客户端用于只读交互
    const publicClient = createPublicClient({
      // 将 viem 连接到浏览器的以太坊提供者（例如 MetaMask）
      transport: custom(window.ethereum)
    });

    try {
      // 使用 publicClient 获取指定地址的余额
      const balance = await publicClient.getBalance({
        address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" // 智能合约的地址
      });

      // 返回的余额单位是 Wei，类型为 BigInt
      // 将其格式化为 Ether，以便用户友好显示
      const formattedBalance = formatEther(balance);

      // 将格式化后的余额打印到控制台
      console.log(`合约余额: ${formattedBalance} ETH`);
      // 你也可以在这里更新 UI 元素来显示余额，而不是仅仅打印日志

    } catch (error) {
      // 处理异步调用期间可能出现的错误
      console.error("获取余额时出错:", error);
    }
  } else {
    // 如果未安装 MetaMask 或其他提供者，提示用户
    console.log("请安装 MetaMask！");
    // 如果需要，可以更新 UI 以提示安装
  }
}

// 提取资金
async function withdraw(): Promise<void> {
  console.log("正在提取资金...");

  try {
    await executeContractFunction('withdraw');
  } catch (error) {
    console.error("提取资金失败:", error);
  }
}

// 页面加载时调用
await loadABI();

// 绑定事件监听器
connectButton.onclick = connect;
fundButton.onclick = fund; 
searchButton.onclick = getBalance; 
withdrawButton.onclick = withdraw;