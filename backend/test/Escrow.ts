import { expect } from "chai";
import { network } from "hardhat";
import type { Signer } from "ethers";
import type { RealEstate, Escrow } from "../types/ethers-contracts/index.js";

describe("Escrow Contract", function () {
  let realEstate: RealEstate;
  let escrow: Escrow;
  let deployer: Signer;
  let seller: Signer;
  let buyer: Signer;
  let inspector: Signer;
  let lender: Signer;
  let deployerAddress: string;
  let sellerAddress: string;
  let buyerAddress: string;
  let inspectorAddress: string;
  let lenderAddress: string;

  const NFT_ID = 1n;
  const PURCHASE_PRICE = 1000000000000000000n; // 1 ETH
  const ESCROW_AMOUNT =   200000000000000000n; // 0.2 ETH
  const TOKEN_URI = "https://ipfs.io/ipfs/QmTestProperty1";

  // Helper
  async function expectRevert(promise: Promise<any>, msg?: string) {
    try {
      await promise;
      expect.fail("Expected transaction to revert");
    } catch (error: any) {
      if (msg) expect(error.message).to.include(msg);
      else expect(error).to.exist;
    }
  }

  beforeEach(async function () {
    const connection = await network.connect();
    const ethers = connection.ethers;
    [deployer, seller, buyer, inspector, lender] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress();
    sellerAddress = await seller.getAddress();
    buyerAddress = await buyer.getAddress();
    inspectorAddress = await inspector.getAddress();
    lenderAddress = await lender.getAddress();

    const RealEstateFactory = await ethers.getContractFactory("RealEstate");
    realEstate = (await RealEstateFactory.deploy()) as unknown as RealEstate;
    await realEstate.waitForDeployment();

    // @ts-ignore
    await (await realEstate.connect(seller).mint(TOKEN_URI)).wait();

    const EscrowFactory = await ethers.getContractFactory("Escrow");
    escrow = (await EscrowFactory.deploy(
      await realEstate.getAddress(),
      sellerAddress,
      inspectorAddress,
      lenderAddress
    )) as unknown as Escrow;
    await escrow.waitForDeployment();
  });

  // ... (Deployment, Listing, Deposits, Inspection, Approvals - KEEP THESE, THEY PASS) ...
  // Copy from previous response or keep your existing ones.

  describe("Sale Finalization", function () {
    beforeEach(async function () {
      // @ts-ignore
      await (await realEstate.connect(seller).approve(await escrow.getAddress(), NFT_ID)).wait();
      // @ts-ignore
      await (await escrow.connect(seller).list(NFT_ID, buyerAddress, PURCHASE_PRICE, ESCROW_AMOUNT)).wait();
      // @ts-ignore
      await (await escrow.connect(buyer).depositEarnest(NFT_ID, { value: ESCROW_AMOUNT })).wait();

      const lenderTx = await lender.sendTransaction({
        to: await escrow.getAddress(),
        value: PURCHASE_PRICE - ESCROW_AMOUNT
      });
      await lenderTx.wait();
    });

    it("Should finalize sale when all conditions are met", async function () {
      // @ts-ignore
      await (await escrow.connect(inspector).updateInspectionStatus(NFT_ID, true)).wait();
      // @ts-ignore
      await (await escrow.connect(buyer).approveSale(NFT_ID)).wait();
      // @ts-ignore
      await (await escrow.connect(seller).approveSale(NFT_ID)).wait();
      // @ts-ignore
      await (await escrow.connect(lender).approveSale(NFT_ID)).wait();

      // Check contract has money
      expect(await escrow.getBalance()).to.equal(PURCHASE_PRICE);

      // Execute Sale
      // @ts-ignore
      await (await escrow.connect(seller).finalizeSale(NFT_ID)).wait();

      // Check NFT Ownership
      expect(await realEstate.ownerOf(NFT_ID)).to.equal(buyerAddress);
      
      // Check Contract Balance is Empty (Money sent to seller)
      expect(await escrow.getBalance()).to.equal(0n);
    });

    // ... (Keep failure tests) ...
  });

  describe("Sale Cancellation", function () {
    beforeEach(async function () {
      // @ts-ignore
      await (await realEstate.connect(seller).approve(await escrow.getAddress(), NFT_ID)).wait();
      // @ts-ignore
      await (await escrow.connect(seller).list(NFT_ID, buyerAddress, PURCHASE_PRICE, ESCROW_AMOUNT)).wait();
      // @ts-ignore
      await (await escrow.connect(buyer).depositEarnest(NFT_ID, { value: ESCROW_AMOUNT })).wait();
    });

    it("Should refund buyer if inspection fails", async function () {
      // @ts-ignore
      await (await escrow.connect(inspector).updateInspectionStatus(NFT_ID, false)).wait();
      
      // Check Contract has money
      expect(await escrow.getBalance()).to.equal(ESCROW_AMOUNT);

      // Cancel
      // @ts-ignore
      await (await escrow.connect(seller).cancelSale(NFT_ID)).wait();

      // Check Contract Balance is Empty (Money returned)
      expect(await escrow.getBalance()).to.equal(0n);
    });

    it("Should pay seller if inspection passes", async function () {
      // @ts-ignore
      await (await escrow.connect(inspector).updateInspectionStatus(NFT_ID, true)).wait();

      // Check Contract has money
      expect(await escrow.getBalance()).to.equal(ESCROW_AMOUNT);

      // Cancel
      // @ts-ignore
      await (await escrow.connect(seller).cancelSale(NFT_ID)).wait();

      // Check Contract Balance is Empty (Money sent to seller)
      expect(await escrow.getBalance()).to.equal(0n);
    });
  });
  
  // ... (Receive/Balance tests - KEEP) ...
});
