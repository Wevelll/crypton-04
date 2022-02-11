import { task } from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("createItem", "Mints token from <contract> and creates a listing")
.addParam("address", "Token address")
.addParam("price", "Listing price")
.setAction( async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const price = await hre.ethers.utils.parseEther(taskArgs.price);
    const result = await contract.connect(me).createItem(taskArgs.address, price);
    console.log("ok");
})