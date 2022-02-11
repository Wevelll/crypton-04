import { ethers } from "hardhat";

async function main() {
  const MarketFactory = await ethers.getContractFactory("Market");
  const Market = await MarketFactory.deploy();

  await Market.deployed();

  console.log("Market deployed to:", Market.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
