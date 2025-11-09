async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Sepolia USDC
  const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

  const Vault = await ethers.getContractFactory("PropertyVault");
  const vault = await Vault.deploy(USDC, deployer.address);
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("PropertyVault deployed to:", address);

  // Save to frontend
  const fs = require("fs");
  const data = { address, abi: vault.interface.format() };
  fs.writeFileSync("frontend/src/contractData.json", JSON.stringify(data, null, 2));
  console.log("contractData.json saved");
}

main().catch(console.error);
