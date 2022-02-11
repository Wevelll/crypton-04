import { task } from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("makeBid", "Make bid on auction")
.addParam("id", "Auction id")
.addParam("bid", "Value to bid")
.setAction( async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const val = await hre.ethers.utils.parseEther(taskArgs.bid);
    const result = await contract.connect(me).makeBid(taskArgs.id, {value: val});
    console.log("ok");
});