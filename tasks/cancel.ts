import {task} from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("cancel", "Cancel listing")
.addParam("id", "Listing id")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const result = await contract.connect(me).cancel(taskArgs.id);
    console.log("ok");
})