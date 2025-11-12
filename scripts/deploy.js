require("@nomicfoundation/hardhat-toolbox");

async function main() {
  const [deployer, tenant] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. DEPLOY MOCK USDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("Mock USDC deployed to:", usdcAddress);

  // 2. GIVE TENANT SOME USDC
  await usdc.mint(tenant.address, ethers.parseUnits("1000", 6));
  console.log("Minted 1000 USDC to tenant");

  // 3. DEPLOY PROPERTY VAULT
  const PropertyVault = await ethers.getContractFactory("PropertyVault");
  const propertyVault = await PropertyVault.deploy(usdcAddress, deployer.address);
  await propertyVault.waitForDeployment();
  const vaultAddress = await propertyVault.getAddress();
  console.log("PropertyVault deployed to:", vaultAddress);

  // 4. SAVE TO FRONTEND
  const fs = require("fs");
  const contractData = {
    address: vaultAddress,
    abi: JSON.parse(propertyVault.interface.formatJson())
  };

  fs.writeFileSync(
    "frontend/src/contractData.json",
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to frontend/src/contractData.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });