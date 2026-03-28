export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_TESTNET_RPC = "https://testnet-rpc.monad.xyz/";

export const ADDRESSES = {
  vault: "0x3D2624499f1a62fE1D354515676A2301561BfCc0",
  lending: "0xf732BA6F915393662C8B4748dB707e07E4436eAb",
  lp: "0x67B7421aa3371797C5398722bBcdDCba8251B6a3",
  staking: "0x9FCbF982d00Ea8B2a376ceF16C395db0b094F5C0",
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
