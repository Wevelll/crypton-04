import { task } from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("buyItem", "Buy item from listing[id]")
.addParam("id", "Listing ID")
.addParam("price", "Price")
.setAction( async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const price = await hre.ethers.utils.parseEther(taskArgs.price);
    const result = await contract.connect(me).buyItem(taskArgs.id, {value:price});
    console.log("ok");
});