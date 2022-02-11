import { task } from "hardhat/config";
import { marketAddr } from "../hardhat.config";

task("listItemOnAuction", "Creates auction with existing token")
.addParam("token", "Token address")
.addParam("id", "Token ID")
.addParam("price", "Listing base price")
.setAction( async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("Market", marketAddr);
    const price = await hre.ethers.utils.parseEther(taskArgs.price);
    const result = await contract.connect(me).listItemOnAuction(
        taskArgs.token,
        taskArgs.id,
        price
    );
    console.log("ok");
})