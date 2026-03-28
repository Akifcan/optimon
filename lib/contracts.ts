export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_TESTNET_RPC = "https://testnet-rpc.monad.xyz/";

export const ADDRESSES = {
  vault: "0x51D16446D3d083C07EFd72bA85D54F690e6bFc5e",
  lending: "0xB6a9F53c17EE48D1c248a28AC044d4e5F149F38e",
  lp: "0x66f668a18270e4b78E346f9F339763E6906498F2",
  staking: "0x6072cbF26E88b411f94BdC97e0Ee561269069227",
} as const;

export const VAULT_ABI = [
  "function deposit() external payable",
  "function withdraw() external",
  "function rebalance() external",
  "function totalValue() external view returns (uint256)",
  "function userValue(address _user) external view returns (uint256)",
  "function shares(address) external view returns (uint256)",
  "function totalShares() external view returns (uint256)",
  "function strategies(uint256) external view returns (address strategy, uint256 weight)",
  "function strategyCount() external view returns (uint256)",
  "function setWeights(uint256[] calldata _weights) external",
  "function owner() external view returns (address)",
  "event Deposit(address indexed user, uint256 amount, uint256 sharesMinted)",
  "event Withdraw(address indexed user, uint256 amount, uint256 sharesBurned)",
  "event Rebalance(uint256 timestamp)",
] as const;

export const STRATEGY_ABI = [
  "function totalBalance() view returns (uint256)",
  "function apyBps() view returns (uint256)",
  "function riskScore() view returns (uint256)",
  "function principal() view returns (uint256)",
] as const;

export const STRATEGY_META = [
  { name: "Lending", address: ADDRESSES.lending },
  { name: "LP Pool", address: ADDRESSES.lp },
  { name: "Staking", address: ADDRESSES.staking },
] as const;
