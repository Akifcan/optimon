import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "monadTestnet",
  chainType: "l1",
});

const [deployer] = await ethers.getSigners();
console.log("Deploying with:", deployer.address);
console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON");

// 1. Deploy Vault
const Vault = await ethers.getContractFactory("Vault");
const vault = await Vault.deploy();
await vault.waitForDeployment();
const vaultAddr = await vault.getAddress();
console.log("Vault deployed:", vaultAddr);

// 2. Deploy Strategies
const Lending = await ethers.getContractFactory("LendingStrategy");
const lending = await Lending.deploy(vaultAddr);
await lending.waitForDeployment();
const lendingAddr = await lending.getAddress();
console.log("LendingStrategy deployed:", lendingAddr);

const LP = await ethers.getContractFactory("LPStrategy");
const lp = await LP.deploy(vaultAddr);
await lp.waitForDeployment();
const lpAddr = await lp.getAddress();
console.log("LPStrategy deployed:", lpAddr);

const Staking = await ethers.getContractFactory("StakingStrategy");
const staking = await Staking.deploy(vaultAddr);
await staking.waitForDeployment();
const stakingAddr = await staking.getAddress();
console.log("StakingStrategy deployed:", stakingAddr);

// 3. Register strategies in vault (40%, 30%, 30%)
let tx = await vault.addStrategy(lendingAddr, 4000);
await tx.wait();
console.log("Added LendingStrategy (40%)");

tx = await vault.addStrategy(lpAddr, 3000);
await tx.wait();
console.log("Added LPStrategy (30%)");

tx = await vault.addStrategy(stakingAddr, 3000);
await tx.wait();
console.log("Added StakingStrategy (30%)");

console.log("\n--- Deployment Complete ---");
console.log("Vault:           ", vaultAddr);
console.log("LendingStrategy: ", lendingAddr);
console.log("LPStrategy:      ", lpAddr);
console.log("StakingStrategy: ", stakingAddr);
