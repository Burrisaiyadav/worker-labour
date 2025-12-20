import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LabourWallet = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const data = await api.get('/payments/wallet');
                setBalance(data.balance);
                const formattedTx = data.transactions.map(tx => ({
                    ...tx,
                    date: new Date(tx.date).toLocaleString(), // Format date
                    from: tx.from === 'Self' ? 'Bank Transfer' : 'Payment Received' // Simple name mapping
                }));
                setTransactions(formattedTx);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch wallet", err);
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Wallet Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                             <div className="relative z-10">
                                <p className="text-green-100 font-medium mb-1 flex items-center gap-2"><Wallet className="h-4 w-4"/> Total Balance</p>
                                <h2 className="text-4xl font-bold tracking-tight mb-2">₹{balance.toLocaleString()}.00</h2>
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Transaction History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                                <button onClick={() => navigate('/labour/history')} className="text-sm text-green-600 font-semibold hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                                    View Job History
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{tx.desc}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    {tx.date} • {tx.from}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                            </p>
                                            <button className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto mt-1 hover:text-gray-600">
                                                <Download size={12} /> Invoice
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Footer Link */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                <button className="text-sm font-semibold text-gray-500 hover:text-gray-900">Load More Transactions</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LabourWallet;
