import { task } from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("cancelAuction", "Cancel auction")
.addParam("id", "Auction id")
.setAction( async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const result = await contract.connect(me).cancelAuction(taskArgs.id);
    console.log("ok");
})