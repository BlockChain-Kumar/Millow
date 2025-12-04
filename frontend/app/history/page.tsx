"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navigation from "@/components/Navigation";

type Transaction = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: string;
};

export default function History() {
  const [account, setAccount] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setAccount(ethers.getAddress(accounts[0]));
      }
    };
    loadAccount();

    // Mock transaction history (in production, query blockchain events)
    setTimeout(() => {
      setTransactions([
        {
          hash: "0xabc123...",
          from: "0x7099...",
          to: "0xe7f1...",
          value: "5.0",
          timestamp: new Date().toLocaleString(),
          status: "Success"
        }
      ]);
      setLoading(false);
    }, 1000);

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: unknown) => {
        const accts = accounts as string[];
        if (accts.length > 0) setAccount(ethers.getAddress(accts[0]));
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation account={account} setAccount={setAccount} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Transaction History</h1>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-gray-600 text-lg">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Transaction Hash</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">From</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Value (ETH)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-6 py-4 text-sm text-blue-600 font-mono">{tx.hash}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{tx.from}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{tx.to}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{tx.value}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tx.timestamp}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
