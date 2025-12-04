"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navigation from "@/components/Navigation";
import RealEstateABI from "@/constants/RealEstate_ABI.json";
import EscrowABI from "@/constants/Escrow_ABI.json";
import RealEstateAddress from "@/constants/RealEstate_Address.json";
import EscrowAddress from "@/constants/Escrow_Address.json";

type PropertyData = {
  tokenId: number;
  name: string;
  role: string;
  status: string;
  image: string;
  actionRequired: boolean;
};

export default function MyProperties() {
  const [account, setAccount] = useState<string>("");
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setAccount(ethers.getAddress(accounts[0]));
        }

        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const realEstate = new ethers.Contract(RealEstateAddress.address, RealEstateABI, provider);
        const escrow = new ethers.Contract(EscrowAddress.address, EscrowABI, provider);

        const totalSupply = await realEstate.totalSupply();
        const userProperties: PropertyData[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const escrowContract = escrow as any;
        const seller = await escrowContract.seller();
        const inspector = await escrowContract.inspector();
        const lender = await escrowContract.lender();

        for (let i = 1; i <= Number(totalSupply); i++) {
          const isListed = await escrowContract.isListed(i);
          if (!isListed) continue;

          const buyer = await escrowContract.buyer(i);
          const inspectionPassed = await escrowContract.inspectionPassed(i);
          const lenderApproved = await escrowContract.approval(i, lender);
          const sellerApproved = await escrowContract.approval(i, seller);

          const contractBalance = await provider.getBalance(await escrow.getAddress());
          const escrowAmount = await escrowContract.escrowAmount(i);
          const earnestDeposited = contractBalance >= escrowAmount;

          let role = "";
          let actionRequired = false;
          let status = "";

          if (accounts[0] && buyer.toLowerCase() === accounts[0].toLowerCase()) {
            role = "Buyer";
            if (!earnestDeposited) {
              status = "Deposit Earnest";
              actionRequired = true;
            } else if (earnestDeposited && inspectionPassed && lenderApproved && sellerApproved) {
              status = "Ready to Finalize";
              actionRequired = true;
            } else {
              status = "Awaiting Approvals";
            }
          }

          if (accounts[0] && seller.toLowerCase() === accounts[0].toLowerCase()) {
            role = "Seller";
            if (earnestDeposited && !sellerApproved) {
              status = "Approve Sale";
              actionRequired = true;
            } else if (sellerApproved) {
              status = "Approved";
            } else {
              status = "Awaiting Earnest";
            }
          }

          if (accounts[0] && inspector.toLowerCase() === accounts[0].toLowerCase()) {
            role = "Inspector";
            if (earnestDeposited && !inspectionPassed) {
              status = "Inspect Property";
              actionRequired = true;
            } else if (inspectionPassed) {
              status = "Inspected";
            } else {
              status = "Awaiting Earnest";
            }
          }

          if (accounts[0] && lender.toLowerCase() === accounts[0].toLowerCase()) {
            role = "Lender";
            if (earnestDeposited && !lenderApproved) {
              status = "Approve Loan";
              actionRequired = true;
            } else if (lenderApproved) {
              status = "Approved";
            } else {
              status = "Awaiting Earnest";
            }
          }

          if (role) {
            userProperties.push({
              tokenId: i,
              name: `Millow Villa #${i}`,
              role,
              status,
              image: `https://robohash.org/${i}?set=set2&size=400x400`,
              actionRequired
            });
          }
        }

        setProperties(userProperties);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: unknown) => {
        const accts = accounts as string[];
        if (accts.length > 0) {
          setAccount(ethers.getAddress(accts[0]));
          setLoading(true);
          loadProperties();
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation account={account} setAccount={setAccount} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Properties</h1>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading your properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-gray-600 text-lg mb-4">You have no properties yet</p>
            <p className="text-gray-500">Browse listings to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.tokenId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{property.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-indigo-600">{property.role}</span>
                    <span className={`text-sm font-semibold ${property.actionRequired ? 'text-red-600' : 'text-green-600'}`}>
                      {property.status}
                    </span>
                  </div>
                  {property.actionRequired && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 font-semibold">⚠️ Action Required</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
