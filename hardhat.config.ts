import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

export const marketAddr = process.env.MARKET_ADDR !== undefined ? process.env.MARKET_ADDR : "";

const config: HardhatUserConfig = {
  solidity: "0.8.1",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    },
  },
  etherscan: {
    apiKey: 
      process.env.ETHERSCAN_KEY !== undefined ? process.env.ETHERSCAN_KEY : ""
  }
};

export default config;
