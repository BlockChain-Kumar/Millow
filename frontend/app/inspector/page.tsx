"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navigation from "@/components/Navigation";
import EscrowABI from "@/constants/Escrow_ABI.json";
import EscrowAddress from "@/constants/Escrow_Address.json";

type InspectionProperty = {
  tokenId: number;
  name: string;
  image: string;
  status: string;
  needsInspection: boolean;
};

export default function InspectorDashboard() {
  const [account, setAccount] = useState<string>("");
  const [properties, setProperties] = useState<InspectionProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInspector, setIsInspector] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setAccount(ethers.getAddress(accounts[0]));
        }

        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const escrow = new ethers.Contract(EscrowAddress.address, EscrowABI, provider);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const escrowContract = escrow as any;
        const inspector = await escrowContract.inspector();

        if (accounts[0] && inspector.toLowerCase() === accounts[0].toLowerCase()) {
          setIsInspector(true);

          const propertiesList: InspectionProperty[] = [];
          
          for (let i = 1; i <= 10; i++) {
            try {
              const isListed = await escrowContract.isListed(i);
              if (!isListed) continue;

              const inspectionPassed = await escrowContract.inspectionPassed(i);
              const escrowAmount = await escrowContract.escrowAmount(i);
              const contractBalance = await provider.getBalance(await escrow.getAddress());
              const earnestDeposited = contractBalance >= escrowAmount;

              propertiesList.push({
                tokenId: i,
                name: `Millow Villa #${i}`,
                image: `https://robohash.org/${i}?set=set2&size=400x400`,
                status: inspectionPassed ? "Inspected ✅" : earnestDeposited ? "Ready for Inspection" : "Awaiting Earnest",
                needsInspection: earnestDeposited && !inspectionPassed
              });
            } catch {
              break;
            }
          }

          setProperties(propertiesList);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleInspect = async (tokenId: number) => {
    if (!window.ethereum) return;

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const escrow = new ethers.Contract(EscrowAddress.address, EscrowABI, signer);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (escrow as any).updateInspectionStatus(tokenId);
      await tx.wait();

      alert("Inspection approved!");
      window.location.reload();
    } catch (error) {
      console.error("Error approving inspection:", error);
      alert("Failed to approve inspection. See console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation account={account} setAccount={setAccount} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Inspector Dashboard</h1>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : !isInspector ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-gray-600 text-lg mb-4">You are not registered as an inspector</p>
            <p className="text-gray-500">Only designated inspectors can access this page</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-gray-600 text-lg">No properties to inspect</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.tokenId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{property.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{property.status}</p>
                  
                  {property.needsInspection && (
                    <button
                      onClick={() => handleInspect(property.tokenId)}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      Approve Inspection
                    </button>
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
