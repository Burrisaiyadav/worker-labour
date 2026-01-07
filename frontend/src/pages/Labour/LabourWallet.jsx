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
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">My Wallet</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Manage your earnings and withdraw funds.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="h-12 px-6 bg-green-600 text-white rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95">
                            <Download size={16} /> Withdraw All
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Wallet Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-green-600 to-green-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-green-200 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-white/10 duration-700"></div>
                             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 rounded-full transition-all group-hover:bg-black/10 duration-700"></div>
                             <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-4 flex items-center gap-2">
                                    <Wallet className="h-4 w-4"/> Available Balance
                                </p>
                                <h2 className="text-5xl font-black tracking-tighter mb-8 italic">₹{balance.toLocaleString()}.00</h2>
                                
                                <div className="space-y-4 pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-green-200 uppercase tracking-widest text-[9px]">Account Number</span>
                                        <span className="font-mono font-black italic">**** 8293</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-green-200 uppercase tracking-widest text-[9px]">IFSC Code</span>
                                        <span className="font-mono font-black italic">KKBK0001923</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                        
                        <div className="mt-8 bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
                            <h4 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-4">Quick Tip</h4>
                            <p className="text-[11px] text-blue-700 leading-relaxed font-bold">
                                Your earnings are settled every 24 hours. For instant withdrawal, please use the "FastTrack" option.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Transaction History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-white overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Transactions</h2>
                                <button onClick={() => navigate('/labour/history')} className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:text-green-700 transition-colors">
                                    Detailed History
                                </button>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {transactions.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Wallet className="h-10 w-10 text-gray-200" />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No transactions found</p>
                                    </div>
                                ) : (
                                    transactions.map(tx => (
                                        <div key={tx.id} className="px-10 py-8 hover:bg-gray-50 transition-all flex items-center justify-between group cursor-default border-l-4 border-transparent hover:border-green-500">
                                            <div className="flex items-center gap-6">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 shadow-sm ${tx.type === 'credit' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                    {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase tracking-tighter text-lg">{tx.desc}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                        {tx.date} • {tx.from}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xl font-black tracking-tighter ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                                </p>
                                                <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 ml-auto mt-2 hover:text-blue-800">
                                                    <Download size={10} /> PDF
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="p-8 bg-gray-50/50 text-center border-t border-gray-50">
                                <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Load Older Transactions</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LabourWallet;
