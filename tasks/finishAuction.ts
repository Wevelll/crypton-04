import {task} from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("finishAuction", "Finishes auction with <id>")
.addParam("id", "Auction ID")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const result = await contract.connect(me).finishAuction(taskArgs.id);
    console.log("ok");
})