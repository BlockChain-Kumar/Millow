import { expect } from "chai";
import { network } from "hardhat";
import { RealEstate } from "../types/ethers-contracts/index.js";

describe("RealEstate Contract", function () {
  let realEstate: RealEstate;
  let account1: { address: string };
  let account2: { address: string };
  let deployer: { address: string };

  beforeEach(async function () {
    const connection = await network.connect();
    const ethers = connection.ethers;
    const signers = await ethers.getSigners();
    deployer = signers[0];
    account1 = signers[1];
    account2 = signers[2];

    const RealEstateFactory = await ethers.getContractFactory("RealEstate");
    realEstate = (await RealEstateFactory.deploy()) as unknown as RealEstate;
    await realEstate.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await realEstate.name()).to.equal("Real Estate");
      expect(await realEstate.symbol()).to.equal("REAL");
    });

    it("Should start with totalSupply of 0", async function () {
      expect(await realEstate.totalSupply()).to.equal(0n);
    });
  });

  describe("Minting", function () {
    const tokenURI = "https://ipfs.io/ipfs/QmTestHash123";

    it("Should mint a new NFT and increment tokenId", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
      expect(await realEstate.totalSupply()).to.equal(1n);
    });

    it("Should set the correct tokenURI", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
      expect(await realEstate.tokenURI(1n)).to.equal(tokenURI);
    });

    it("Should mint multiple NFTs with sequential tokenIds", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
      expect(await realEstate.totalSupply()).to.equal(2n);
    });

    it("Should allow the same address to mint multiple NFTs", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
      expect(await realEstate.totalSupply()).to.equal(2n);
    });

    it("Should return the correct tokenId from mint function", async function () {
      // @ts-ignore
      const tx = await realEstate.connect(account1).mint(tokenURI);
      await tx.wait();
      expect(await realEstate.ownerOf(1n)).to.equal(account1.address);
    });
  });

  describe("Token Transfers", function () {
    const tokenURI = "https://ipfs.io/ipfs/QmTest";

    beforeEach(async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
    });

    it("Should allow owner to transfer NFT", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).transferFrom(account1.address, account2.address, 1n)).wait();
      expect(await realEstate.ownerOf(1n)).to.equal(account2.address);
    });

    it("Should not allow non-owner to transfer NFT", async function () {
      try {
        // @ts-ignore
        await (await realEstate.connect(account2).transferFrom(account1.address, account2.address, 1n)).wait();
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("Approvals", function () {
    const tokenURI = "https://ipfs.io/ipfs/QmTest";

    beforeEach(async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
    });

    it("Should allow owner to approve another address", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).approve(account2.address, 1n)).wait();
      expect(await realEstate.getApproved(1n)).to.equal(account2.address);
    });

    it("Should allow approved address to transfer NFT", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).approve(account2.address, 1n)).wait();
      // @ts-ignore
      await (await realEstate.connect(account2).transferFrom(account1.address, deployer.address, 1n)).wait();
      expect(await realEstate.ownerOf(1n)).to.equal(deployer.address);
    });

    it("Should allow setApprovalForAll", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).setApprovalForAll(account2.address, true)).wait();
      expect(await realEstate.isApprovedForAll(account1.address, account2.address)).to.be.true;
    });

    it("Should allow operator to transfer after setApprovalForAll", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).setApprovalForAll(account2.address, true)).wait();
      // @ts-ignore
      await (await realEstate.connect(account2).transferFrom(account1.address, deployer.address, 1n)).wait();
      expect(await realEstate.ownerOf(1n)).to.equal(deployer.address);
    });
  });

  describe("Token URI", function () {
    const tokenURI = "https://ipfs.io/ipfs/QmTest";

    it("Should revert when querying tokenURI for non-existent token", async function () {
      try {
        await realEstate.tokenURI(99n);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it("Should return correct tokenURI after minting", async function () {
      // @ts-ignore
      await (await realEstate.connect(account1).mint(tokenURI)).wait();
      expect(await realEstate.tokenURI(1n)).to.equal(tokenURI);
    });
  });
});
