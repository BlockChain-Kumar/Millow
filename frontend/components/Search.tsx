"use client";

import { useState } from "react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // Add search functionality here
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="mb-6 flex justify-center">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/20">
            🔥 Decentralized Real Estate Platform
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Search it.
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">
            Explore it.
          </span>
          <br />
          <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Own it.
          </span>
        </h1>

        <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
          Buy and sell real estate as NFTs with blockchain-powered escrow
        </p>

        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-2xl">
              <svg className="ml-6 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 py-5 px-6 text-gray-900 bg-transparent focus:outline-none text-lg"
                placeholder="Enter address, city, or ZIP code..."
              />
              <button
                type="submit"
                className="m-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <div className="mt-10 flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-indigo-200">3 Properties Live</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-indigo-200">Secure Escrow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-indigo-200">NFT Ownership</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 15s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </header>
  );
};

export default Search;
