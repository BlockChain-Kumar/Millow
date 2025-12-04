"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navigation from "@/components/Navigation";
import RealEstateABI from "@/constants/RealEstate_ABI.json";
import EscrowABI from "@/constants/Escrow_ABI.json";
import RealEstateAddress from "@/constants/RealEstate_Address.json";
import EscrowAddress from "@/constants/Escrow_Address.json";

export default function ListProperty() {
  const [account, setAccount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    buyerAddress: "",
    purchasePrice: "15",
    escrowAmount: "5",
    metadataURI: ""
  });

  useEffect(() => {
    const loadAccount = async () => {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setAccount(ethers.getAddress(accounts[0]));
      }
    };
    loadAccount();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: unknown) => {
        const accts = accounts as string[];
        if (accts.length > 0) setAccount(ethers.getAddress(accts[0]));
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !window.ethereum) {
      alert("Please connect your wallet!");
      return;
    }

    setLoading(true);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      if (Number(network.chainId) !== 1337) {
        alert("Wrong network! Switch to Localhost (Chain ID 1337).");
        setLoading(false);
        return;
      }

      // Mint NFT
      const realEstate = new ethers.Contract(RealEstateAddress.address, RealEstateABI, signer);
      console.log("Minting NFT...");
      
      const metadataURI = formData.metadataURI || `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json`;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mintTx = await (realEstate as any).mint(metadataURI);
      await mintTx.wait();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalSupply = await (realEstate as any).totalSupply();
      const newTokenId = Number(totalSupply);
      
      console.log("NFT Minted! Token ID:", newTokenId);

      // Approve Escrow
      const escrow = new ethers.Contract(EscrowAddress.address, EscrowABI, signer);
      console.log("Approving escrow...");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const approveTx = await (realEstate as any).approve(EscrowAddress.address, newTokenId);
      await approveTx.wait();

      // List in Escrow
      console.log("Listing in escrow...");
      const purchasePrice = ethers.parseUnits(formData.purchasePrice, "ether");
      const escrowAmount = ethers.parseUnits(formData.escrowAmount, "ether");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listTx = await (escrow as any).list(
        newTokenId,
        formData.buyerAddress,
        purchasePrice,
        escrowAmount
      );
      await listTx.wait();

      alert(`Success! Property listed with Token ID: ${newTokenId}`);
      
      // Reset form
      setFormData({
        buyerAddress: "",
        purchasePrice: "15",
        escrowAmount: "5",
        metadataURI: ""
      });

    } catch (error) {
      console.error("Error listing property:", error);
      
      let errorMessage = "Failed to list property. See console.";
      if (error && typeof error === 'object') {
        const err = error as { code?: string; message?: string };
        if (err.code === "ACTION_REJECTED") {
          errorMessage = "Transaction cancelled by user.";
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation account={account} setAccount={setAccount} />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">List New Property</h1>

        {!account ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Connect your wallet to list a property</p>
            <p className="text-gray-500">You must be a seller to list properties</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buyer Address
              </label>
              <input
                type="text"
                name="buyerAddress"
                value={formData.buyerAddress}
                onChange={handleChange}
                placeholder="0x..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Ethereum address of the designated buyer</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purchase Price (ETH)
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                step="0.1"
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Earnest Amount (ETH)
              </label>
              <input
                type="number"
                name="escrowAmount"
                value={formData.escrowAmount}
                onChange={handleChange}
                step="0.1"
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Initial deposit required from buyer</p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Metadata URI (Optional)
              </label>
              <input
                type="text"
                name="metadataURI"
                value={formData.metadataURI}
                onChange={handleChange}
                placeholder="https://ipfs.io/ipfs/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">IPFS URI for property metadata (auto-generated if empty)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "List Property"}
            </button>

            {loading && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ⏳ Please confirm all transactions in MetaMask (Mint → Approve → List)
                </p>
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
