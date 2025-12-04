"use client";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavProps = {
  account: string;
  setAccount: (account: string) => void;
};

const Navigation = ({ account, setAccount }: NavProps) => {
  const [balance, setBalance] = useState<string>("0");
  const [showDropdown, setShowDropdown] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try {
          const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
          const provider = new ethers.JsonRpcProvider(rpcUrl);

          const bal = await provider.getBalance(account);
          const formattedBal = parseFloat(ethers.formatEther(bal)).toFixed(4);
          setBalance(formattedBal);

          // Detect user role
          // You can enhance this by checking contracts
          if (parseFloat(formattedBal) > 9500) {
            setUserRole("Seller/Inspector/Lender");
          } else if (parseFloat(formattedBal) < 9500 && parseFloat(formattedBal) > 100) {
            setUserRole("Buyer");
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance("Error");
        }
      } else {
        setBalance("0");
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, [account]);

  const connectHandler = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      if (accounts.length > 0) {
        const account = ethers.getAddress(accounts[0]);
        setAccount(account);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const disconnectHandler = () => {
    setAccount("");
    setShowDropdown(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    alert("Address copied to clipboard!");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-2xl border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:from-indigo-300 hover:to-purple-400 transition-all duration-300"
          >
            🏠 Millow
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`relative font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'text-indigo-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Browse
              {isActive('/') && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500"></span>
              )}
            </Link>
            
            <Link 
              href="/my-properties" 
              className={`relative font-semibold transition-all duration-300 ${
                isActive('/my-properties') 
                  ? 'text-indigo-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              My Properties
              {isActive('/my-properties') && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500"></span>
              )}
            </Link>
            
            <Link 
              href="/list-property" 
              className={`relative font-semibold transition-all duration-300 ${
                isActive('/list-property') 
                  ? 'text-indigo-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              List Property
              {isActive('/list-property') && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500"></span>
              )}
            </Link>
            
            <Link 
              href="/history" 
              className={`relative font-semibold transition-all duration-300 ${
                isActive('/history') 
                  ? 'text-indigo-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              History
              {isActive('/history') && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500"></span>
              )}
            </Link>
          </div>

          {/* Account Section */}
          <div className="flex items-center gap-4">
            {account && (
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-yellow-500 px-4 py-2 rounded-xl shadow-lg border border-yellow-400">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-xs text-yellow-100">Balance</p>
                  <p className="font-bold text-white">{balance} ETH</p>
                </div>
              </div>
            )}

            {account ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-full font-bold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                  <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                      <p className="text-xs text-indigo-200 mb-1">Connected Account</p>
                      <p className="font-mono text-sm text-white break-all">{account}</p>
                      {userRole && (
                        <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
                          {userRole}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={copyAddress}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Address
                      </button>
                      
                      <button
                        onClick={disconnectHandler}
                        className="w-full text-left px-4 py-3 hover:bg-red-600/20 text-red-400 rounded-lg transition flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectHandler}
                className="bg-gradient-to-r from-white to-gray-100 text-black px-8 py-3 rounded-full font-bold hover:from-gray-100 hover:to-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
