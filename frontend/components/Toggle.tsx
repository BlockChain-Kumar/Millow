"use client";

import { HomeAttributes } from "@/types";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

type ToggleProps = {
    home: HomeAttributes;
    togglePop: () => void;
    account: string;
    escrow: ethers.Contract | null;
};

type PropertyStatus = {
    isListed: boolean;
    buyer: string;
    seller: string;
    inspector: string;
    lender: string;
    purchasePrice: string;
    escrowAmount: string;
    inspectionPassed: boolean;
    lenderApproved: boolean;
    sellerApproved: boolean;
    earnestDeposited: boolean;
};

const Toggle = ({ home, togglePop, account, escrow }: ToggleProps) => {
    const [status, setStatus] = useState<PropertyStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState<string>("viewer");

    // Fetch property status
    useEffect(() => {
        const fetchStatus = async () => {
            if (!escrow) return;
            
            try {
                const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const escrowRead = escrow.connect(provider);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const escrowContract = escrowRead as any;

                const isListed = await escrowContract.isListed(home.id);
                const buyer = await escrowContract.buyer(home.id);
                const seller = await escrowContract.seller();
                const inspector = await escrowContract.inspector();
                const lender = await escrowContract.lender();
                const purchasePrice = await escrowContract.purchasePrice(home.id);
                const escrowAmount = await escrowContract.escrowAmount(home.id);
                const inspectionPassed = await escrowContract.inspectionPassed(home.id);
                const lenderApproved = await escrowContract.approval(home.id, lender);
                const sellerApproved = await escrowContract.approval(home.id, seller);

                // Check if earnest is deposited (balance > 0)
                const contractBalance = await provider.getBalance(await escrowRead.getAddress());
                const earnestDeposited = contractBalance >= escrowAmount;

                setStatus({
                    isListed,
                    buyer,
                    seller,
                    inspector,
                    lender,
                    purchasePrice: ethers.formatEther(purchasePrice),
                    escrowAmount: ethers.formatEther(escrowAmount),
                    inspectionPassed,
                    lenderApproved,
                    sellerApproved,
                    earnestDeposited
                });

                // Determine user role
                if (account.toLowerCase() === buyer.toLowerCase()) {
                    setUserRole("buyer");
                } else if (account.toLowerCase() === seller.toLowerCase()) {
                    setUserRole("seller");
                } else if (account.toLowerCase() === inspector.toLowerCase()) {
                    setUserRole("inspector");
                } else if (account.toLowerCase() === lender.toLowerCase()) {
                    setUserRole("lender");
                } else {
                    setUserRole("viewer");
                }

            } catch (error) {
                console.error("Error fetching status:", error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [escrow, home.id, account]);

    // Transaction handlers
    const handleTransaction = async (
        action: string,
        contractMethod: string,
        value?: bigint
    ) => {
        if (!escrow || !window.ethereum) {
            alert("Please connect MetaMask!");
            return;
        }

        setLoading(true);
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();

            if (Number(network.chainId) !== 1337) {
                alert(`Wrong network! Switch to Localhost (Chain ID 1337).`);
                return;
            }

            const escrowWithSigner = escrow.connect(signer);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const contract = escrowWithSigner as any;

            let transaction;
            if (value) {
                transaction = await contract[contractMethod](home.id, { value });
            } else {
                transaction = await contract[contractMethod](home.id);
            }

            console.log(`${action} transaction sent:`, transaction.hash);
            await transaction.wait();

            alert(`${action} successful!`);
        } catch (error) {
            console.error(`${action} failed:`, error);
            
            let errorMessage = `${action} failed. See console for details.`;
            if (error && typeof error === 'object') {
                const err = error as { code?: string; message?: string };
                if (err.code === "ACTION_REJECTED") {
                    errorMessage = "Transaction cancelled by user.";
                } else if (err.message) {
                    errorMessage = `${action} failed: ${err.message}`;
                }
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const depositEarnest = () => {
        const amount = ethers.parseUnits(status?.escrowAmount || "5", "ether");
        handleTransaction("Earnest Deposit", "depositEarnest", amount);
    };

    const approveInspection = () => {
        handleTransaction("Inspection Approval", "updateInspectionStatus");
    };

    const approveLending = () => {
        handleTransaction("Lender Approval", "approveSale");
    };

    const approveSale = () => {
        handleTransaction("Seller Approval", "approveSale");
    };

    const finalizeSale = () => {
        const remainingAmount = ethers.parseUnits(
            (parseFloat(status?.purchasePrice || "0") - parseFloat(status?.escrowAmount || "0")).toString(),
            "ether"
        );
        handleTransaction("Finalize Sale", "finalizeSale", remainingAmount);
    };

    if (!status) {
        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl">
                    <p className="text-gray-600">Loading property details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={togglePop}
                    className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center font-bold z-10"
                >
                    X
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image */}
                    <div className="h-64 md:h-auto relative bg-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={home.image} alt={home.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col justify-between">
                        {/* Property Info */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{home.name}</h2>
                            <p className="text-xl text-indigo-600 font-bold mb-1">{status.purchasePrice} ETH</p>
                            <p className="text-sm text-gray-500 mb-4">Earnest: {status.escrowAmount} ETH</p>
                            <p className="text-gray-600 mb-4">{home.description}</p>
                            <p className="text-gray-500 text-sm mb-6">{home.address}</p>

                            {/* Your Role */}
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm font-semibold text-blue-900">
                                    Your Role: <span className="capitalize">{userRole}</span>
                                </p>
                            </div>

                            {/* Transaction Status */}
                            <div className="mb-6">
                                <h3 className="font-bold mb-3 text-gray-800">Transaction Progress:</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{status.earnestDeposited ? "✅" : "⏳"}</span>
                                        <span className="text-sm">Earnest Deposited ({status.escrowAmount} ETH)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{status.inspectionPassed ? "✅" : "⏳"}</span>
                                        <span className="text-sm">Inspection Passed</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{status.lenderApproved ? "✅" : "⏳"}</span>
                                        <span className="text-sm">Lender Approved</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{status.sellerApproved ? "✅" : "⏳"}</span>
                                        <span className="text-sm">Seller Approved</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {!account && (
                                <button className="w-full bg-gray-300 text-gray-600 font-bold py-4 rounded-lg cursor-not-allowed">
                                    Connect Wallet to Interact
                                </button>
                            )}

                            {/* Buyer Actions */}
                            {userRole === "buyer" && !status.earnestDeposited && (
                                <button
                                    onClick={depositEarnest}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : `Deposit Earnest (${status.escrowAmount} ETH)`}
                                </button>
                            )}

                            {userRole === "buyer" && status.earnestDeposited && status.inspectionPassed && status.lenderApproved && status.sellerApproved && (
                                <button
                                    onClick={finalizeSale}
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : `Finalize Sale (Pay Remaining ${parseFloat(status.purchasePrice) - parseFloat(status.escrowAmount)} ETH)`}
                                </button>
                            )}

                            {/* Inspector Actions */}
                            {userRole === "inspector" && status.earnestDeposited && !status.inspectionPassed && (
                                <button
                                    onClick={approveInspection}
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Approve Inspection"}
                                </button>
                            )}

                            {/* Lender Actions */}
                            {userRole === "lender" && status.earnestDeposited && !status.lenderApproved && (
                                <button
                                    onClick={approveLending}
                                    disabled={loading}
                                    className="w-full bg-purple-600 text-white font-bold py-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Approve Loan"}
                                </button>
                            )}

                            {/* Seller Actions */}
                            {userRole === "seller" && status.earnestDeposited && !status.sellerApproved && (
                                <button
                                    onClick={approveSale}
                                    disabled={loading}
                                    className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Approve Sale"}
                                </button>
                            )}

                            {/* Viewer Message */}
                            {userRole === "viewer" && (
                                <div className="w-full bg-gray-100 text-gray-600 font-semibold py-4 rounded-lg text-center">
                                    You are viewing as a guest
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Toggle;
