import { EtherscanProvider } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { ERC721Mintable, ERC721Mintable__factory, Market, Market__factory } from "../typechain";

describe("Market", function () {
    let owner: SignerWithAddress;
    let seller: SignerWithAddress;
    let buyer: SignerWithAddress;
    let bidder: SignerWithAddress;
    let Market: Market;
    let _ERC721Mintable: ERC721Mintable;

    before(async function () {
        [owner, seller, buyer, bidder] = await ethers.getSigners();

        const MarketFactory = await ethers.getContractFactory(
            "Market", owner
        ) as Market__factory;
        Market = await MarketFactory.deploy();

        const _ERC721Factory = await ethers.getContractFactory(
            "ERC721Mintable", owner
        ) as ERC721Mintable__factory;
        _ERC721Mintable = await _ERC721Factory.deploy("TestToken", "TTK");
    });

    describe("Deployment", function () {
        it("Set market as minter in token contract", async function () {
            expect (
                await _ERC721Mintable.setMinter(Market.address)
            ).to.satisfy;
        });

        it("Mint a token to seller", async function () {
            expect (
                await _ERC721Mintable.mint(seller.address)
            ).to.satisfy;
        });
    });

    describe("Listing", function () {
        it("List item to sale", async function () {
            expect (
                await _ERC721Mintable.connect(seller).approve(Market.address, 1)
            ).to.satisfy;

            expect (
                await Market.connect(seller).listItem(_ERC721Mintable.address, 1, ethers.utils.parseEther("1"))
            ).to.satisfy;
        });

        it("Create item for sale", async function () {
            expect (
                await Market.connect(seller).createItem(_ERC721Mintable.address, ethers.utils.parseEther("2"))
            ).to.satisfy;
        });

        it("Buy item", async function () {
            expect (
                await Market.connect(buyer).buyItem(1, {value: ethers.utils.parseEther("1")})
            ).to.satisfy;
        });

        it("Cannot buy sold item", async function () {
            await expect (
                Market.connect(bidder).buyItem(1, {value: ethers.utils.parseEther("1")})
            ).to.be.revertedWith("Offer finished!");
        });

        it("Cannot buy when not enough value", async function () {
            await expect (
                Market.connect(bidder).buyItem(2, {value: ethers.utils.parseEther("1")})
            ).to.be.revertedWith("Invalid value!");
        });

        it("Only owner can cancel listing", async function () {
            await expect (
                Market.connect(buyer).cancel(2)
            ).to.be.revertedWith("You are not the owner!");
        });

        it("Cancel item sale", async function () {
            expect (
                await Market.connect(seller).cancel(2)
            ).to.satisfy;
        });

        it("Cannot cancel already cancelled", async function () {
            await expect (
                Market.connect(seller).cancel(2)
            ).to.be.revertedWith("Already cancelled!");
        });
    });

    describe("Auction", function () {
        before(async function() {
            await _ERC721Mintable.mint(seller.address);
            await _ERC721Mintable.mint(seller.address);
        });

        it("List item on auction", async function () {
            expect (
                await _ERC721Mintable.connect(seller).approve(Market.address, 3)
            ).to.satisfy;
            expect (
                await _ERC721Mintable.connect(seller).approve(Market.address, 4)
            ).to.satisfy;
            expect (
                await Market.connect(seller).listItemOnAuction(_ERC721Mintable.address, 3, ethers.utils.parseEther("0.5"))
            ).to.satisfy;
            expect (
                await Market.connect(seller).listItemOnAuction(_ERC721Mintable.address, 4, ethers.utils.parseEther("1.0"))
            ).to.satisfy;
        });

        it("Make bids", async function () {
            expect (
                await Market.makeBid(1, {value: ethers.utils.parseEther("1")})
            ).to.satisfy;
            expect (
                await Market.connect(bidder).makeBid(1, {value: ethers.utils.parseEther("1.5")})
            ).to.satisfy;
            expect (
                await Market.connect(buyer).makeBid(1, {value: ethers.utils.parseEther("2")})
            ).to.satisfy;
            await expect (
                Market.connect(bidder).makeBid(2, {value: ethers.utils.parseEther("0.5")})
            ).to.be.revertedWith("Not enough value!");
        });
        it("Only owner can cancel auction", async function () {
            await expect (
                Market.connect(buyer).cancelAuction(1)
            ).to.be.revertedWith("You are not the owner!");
        });
        
        it("Cannot cancel auction before deadline", async function () {
            await expect (
                Market.connect(seller).cancelAuction(1)
            ).to.be.revertedWith("Cannot cancel yet!");
        });
        
        it("Cannot finish auction before deadline", async function () {
            await expect (
                Market.connect(seller).finishAuction(1)
            ).to.be.revertedWith("Cannot finish yet!");
        });

        it("Finish auction", async function () {
            await network.provider.send("evm_increaseTime", [3600*24*4]);
            await network.provider.send("evm_mine");
            expect (
                await Market.connect(seller).finishAuction(1)
            ).to.satisfy;
        });

        it("Cannot bid on finished auction", async function () {
            await expect (
                Market.connect(bidder).makeBid(1, {value: ethers.utils.parseEther("100")})
            ).to.be.revertedWith("Auction finished!");
        });

        it("Cannot finish auction with <2 bids", async function () {
            await expect (
                Market.connect(seller).finishAuction(2)
            ).to.be.revertedWith("Not enough bids!");
        });

        it("Cancel auction", async function () {
            expect (
                await Market.connect(seller).cancelAuction(2)
            ).to.satisfy;
        });
    });
});