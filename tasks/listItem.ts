import {task } from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("listItem", "Creates listing from existing token")
.addParam("token", "Token address")
.addParam("id", "Token ID")
.addParam("price", "Price")
.setAction( async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const price = await hre.ethers.utils.parseEther(taskArgs.price);
    const result = await contract.connect(me).listItem(taskArgs.token, taskArgs.id, price);
    console.log("ok");
})