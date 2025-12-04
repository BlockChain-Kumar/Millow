"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Type Definitions
import { HomeAttributes } from "@/types";

// Components
import Navigation from "@/components/Navigation";
import Search from "@/components/Search";
import Card from "@/components/Card";
import Toggle from "@/components/Toggle";

// ABIs & Config
import RealEstateABI from "@/constants/RealEstate_ABI.json";
import EscrowABI from "@/constants/Escrow_ABI.json";
import RealEstateAddress from "@/constants/RealEstate_Address.json";
import EscrowAddress from "@/constants/Escrow_Address.json";

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [escrow, setEscrow] = useState<ethers.Contract | null>(null);
  const [homes, setHomes] = useState<HomeAttributes[]>([]);
  const [home, setHome] = useState<HomeAttributes | null>(null);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      // Use environment variable for RPC URL
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      setProvider(provider);

      // NETWORK/ACCOUNT DEBUG
      const network = await provider.getNetwork();
      console.log("Connected to Chain ID:", network.chainId);

      const realEstate = new ethers.Contract(
        RealEstateAddress.address, 
        RealEstateABI, 
        provider
      );
      const escrow = new ethers.Contract(
        EscrowAddress.address, 
        EscrowABI, 
        provider
      );
      setEscrow(escrow);

      const totalSupply = await realEstate.totalSupply();
      const homesArray: HomeAttributes[] = [];
      for (let i = 1; i <= Number(totalSupply); i++) {
        homesArray.push({
          id: i,
          name: `Millow Villa #${i}`,
          address: `${i}00 Crypto Ave, Localhost`,
          description: "A beautiful modern home with smart contract security.",
          price: "15",
          image: `https://robohash.org/${i}?set=set2&size=400x400`,
          isListed: false
        });
      }
      setHomes(homesArray);

      // Get MetaMask account connection
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setAccount(ethers.getAddress(accounts[0]));
        }
        window.ethereum.on('accountsChanged', async (accounts: unknown) => {
             const accts = accounts as string[];
             if (accts.length > 0) setAccount(ethers.getAddress(accts[0]));
             else setAccount("");
        });
      }
    };
    loadBlockchainData();
  }, []);

  useEffect(() => {
    console.log("Current Account:", account);
    if (provider) {
      provider.getNetwork().then(network => {
        console.log("Provider sees chainId:", network.chainId);
      });
    }
  }, [account, provider]);

  const togglePop = (home: HomeAttributes) => {
    setHome(home);
    setToggle(!toggle);
  };

  const closePop = () => {
    setToggle(false);
    setHome(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Current Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {homes.map((home, index) => (
            <Card key={index} home={home} togglePop={togglePop} />
          ))}
        </div>
      </main>

      {toggle && home && (
        <Toggle 
            home={home} 
            togglePop={closePop} 
            account={account} 
            escrow={escrow} 
        />
      )}
    </div>
  );
}
