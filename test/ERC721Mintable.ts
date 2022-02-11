import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC721Mintable, ERC721Mintable__factory } from "../typechain";

describe("ERC721Mintable", function () {
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let _ERC721Mintable: ERC721Mintable;

    before(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const _ERC721Factory = await ethers.getContractFactory(
            "ERC721Mintable", owner
        ) as ERC721Mintable__factory;

        _ERC721Mintable = await _ERC721Factory.deploy("TestTokenz", "TTK");
    });

    describe("Mint", function () {
        it("Mint some tokens", async function () {
            expect (
                await _ERC721Mintable.mint(addr2.address)
            ).to.satisfy;
            expect (
                await _ERC721Mintable.mint(addr2.address)
            ).to.satisfy;
        });
    
        it("Non-minters cannot mint", async function () {
            await expect (
                _ERC721Mintable.connect(addr2).mint(addr1.address)
            ).to.be.revertedWith("You cannot mint!");
        });
    });

    describe("Roles", function () {
        it("Should set/unset roles", async function () {
            expect (
                await _ERC721Mintable.setMinter(addr1.address)
            ).to.satisfy;
            expect (
                await _ERC721Mintable.removeMinter(addr1.address)
            ).to.satisfy;
        });
    });

    describe("URI", function () {
        it("Should set/get baseURI", async function () {
            expect (
                await _ERC721Mintable.setBaseURI("https://example.com/")
            ).to.satisfy;
            expect (
                await _ERC721Mintable.__baseURI()
            ).to.be.equal("https://example.com/");
        });
        it("Should get tokenURI", async function () {
            expect (
                await _ERC721Mintable.tokenURI(1)
            ).to.be.equal("https://example.com/1.json");
        });

        it("No URI for non-existent token", async function () {
            await expect (
                _ERC721Mintable.tokenURI(100)
            ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
        });
    });

    describe("Burn", function () {
        it("Token holder can burn his token", async function () {
            expect (
                await _ERC721Mintable.connect(addr2).burn(2)
            ).to.satisfy;
        });

        it("Cannot burn other's tokens", async function () {
            await expect (
                _ERC721Mintable.connect(owner).burn(1)
            ).to.be.revertedWith("Not your token!");
        });
    });
});