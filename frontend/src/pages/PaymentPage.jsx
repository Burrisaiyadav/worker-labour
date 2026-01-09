import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, CreditCard, Wallet, Smartphone, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

const PaymentPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStep, setPaymentStep] = useState('select'); // select, processing, success
    const [selectedMethod, setSelectedMethod] = useState('upi');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await api.get(`/jobs/${jobId}`);
                setJob(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handlePayment = async () => {
        setPaymentStep('processing');
        
        // Simulate network delay
        setTimeout(async () => {
            try {
                const paymentData = {
                    jobId: jobId,
                    amount: job.cost,
                    method: selectedMethod,
                    payeeId: job.assignedTo
                };
                
                await api.post('/payments', paymentData);
                setPaymentStep('success');
            } catch (err) {
                console.error("Payment failed", err);
                alert("Payment failed. Please try again.");
                setPaymentStep('select');
            }
        }, 2000);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin"></div>
            </div>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-center p-8">
            <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-6">
                <ShieldCheck className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase mb-2">Vault Error</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Transaction credentials not found</p>
            <button onClick={() => navigate(-1)} className="mt-8 px-8 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Go Back</button>
        </div>
    );

    if (paymentStep === 'success') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-5 md:mb-6 shadow-xl shadow-green-100 group">
                    <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-600 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 uppercase">Payment Successful</h1>
                <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 md:mb-8">Your transaction has been securely processed.</p>
                
                <div className="bg-gray-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 w-full max-w-sm mb-6 md:mb-8 text-left shadow-xl shadow-gray-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
                    <div className="relative z-10 space-y-3 md:space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Paid to</p>
                                <p className="text-base md:text-lg lg:text-xl font-black text-white uppercase tracking-tight">{job.group || 'Labour Group'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Amount</p>
                                <p className="text-xl md:text-2xl lg:text-3xl font-black text-green-400 tracking-tighter italic">₹{job.cost.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/10 space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Transaction ID</span>
                                <span className="text-white">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Timestamp</span>
                                <span className="text-white">{new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full max-w-xs gap-3">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 md:py-5 bg-green-600 text-white rounded-xl md:rounded-[1.5rem] font-black text-[8px] md:text-[9px] lg:text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Return to Hub <ArrowRight size={14} />
                    </button>
                    <button className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Download Receipt PDF</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans flex flex-col selection:bg-green-500/30">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="h-12 w-12 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all active:scale-90">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Secure Vault</span>
                    </div>
                    <p className="text-[10px] font-bold text-white mt-0.5 uppercase">Step 3 of 3</p>
                </div>
                <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-black text-xs italic text-green-500">
                    {job.farmerName?.charAt(0) || 'F'}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-lg mx-auto w-full p-5 md:p-6 lg:p-8 space-y-6 md:space-y-8">
                {/* Order Summary */}
                <div className="bg-gradient-to-br from-white/[0.08] to-transparent rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 border border-white/10 backdrop-blur-2xl relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-green-500/10 transition-all duration-700"></div>
                    
                    <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 md:mb-3">Total Payable</p>
                    <div className="flex items-baseline gap-2 group-hover:scale-[1.02] transition-transform duration-500">
                        <span className="text-xl md:text-2xl font-black text-green-500 italic">₹</span>
                        <span className="text-4xl md:text-5xl font-black tracking-tighter italic">{job.cost.toLocaleString()}</span>
                        <span className="text-base md:text-lg font-black text-gray-600 italic">.00</span>
                    </div>
                    <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest">{job.type || job.title}</p>
                            <p className="text-sm md:text-base font-bold text-white tracking-tight uppercase">{job.group || 'Service Provider'}</p>
                        </div>
                        <div className="bg-white/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-widest text-green-400 border border-white/5">
                            ID: {jobId.slice(-6).toUpperCase()}
                        </div>
                    </div>
                </div>

                {paymentStep === 'processing' ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="relative h-32 w-32 scale-125">
                            <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-t-green-500 animate-[spin_1s_linear_infinite]"></div>
                            <div className="absolute inset-4 rounded-full border-2 border-b-blue-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                            <ShieldCheck className="absolute inset-10 h-12 w-12 text-green-500 opacity-50 animate-pulse" />
                        </div>
                        <div className="text-center">
                             <h2 className="text-2xl font-bold uppercase mb-3">Authenticating</h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Contacting banking servers...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <h2 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                            <CreditCard size={14} /> Select Protocol
                        </h2>
                        
                        <div className="grid gap-3 md:gap-4">
                            {[
                                { id: 'upi', name: 'Instant UPI', sub: 'PhonePe, Google Pay, BHIM', icon: Smartphone },
                                { id: 'card', name: 'Credit/Debit Card', sub: 'Visa, Mastercard, RuPay', icon: CreditCard },
                                { id: 'netbanking', name: 'Netbanking', sub: 'HDFC, ICICI, SBI, AXIS', icon: Building2 }
                            ].map(method => {
                                const Icon = method.icon;
                                return (
                                    <button 
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`group w-full flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-[1.8rem] border transition-all duration-500 ${
                                            selectedMethod === method.id 
                                            ? 'bg-green-600 shadow-[0_15px_30px_-10px_rgba(22,163,74,0.3)] border-green-500 scale-[1.02]' 
                                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 md:gap-5">
                                            <div className={`h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-500 ${
                                                selectedMethod === method.id ? 'bg-white text-green-600' : 'bg-white/5 text-gray-400 group-hover:text-white'
                                            }`}>
                                                <Icon className="h-5 w-5 md:h-6 md:w-6" />
                                            </div>
                                            <div className="text-left">
                                                 <p className={`font-bold text-sm md:text-base tracking-tight uppercase transition-colors ${selectedMethod === method.id ? 'text-white' : 'text-gray-300'}`}>
                                                     {method.name}
                                                 </p>
                                                <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-0.5 transition-colors ${selectedMethod === method.id ? 'text-green-200' : 'text-gray-500'}`}>
                                                    {method.sub}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedMethod === method.id && (
                                            <div className="h-4 w-4 md:h-5 md:w-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-600" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-4 md:pt-6">
                            <button 
                                onClick={handlePayment}
                                className="w-full h-16 md:h-20 bg-green-600 hover:bg-green-500 text-white rounded-2xl md:rounded-[2.5rem] font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-green-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                Secure Payment <ArrowRight size={16} md:size={18} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <p className="text-center mt-4 md:mt-6 text-[7px] md:text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] opacity-60">
                                Click to authorize secure gateway connection
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-10 text-center bg-black/40 mt-auto border-t border-white/5">
                <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <ShieldCheck className="h-3 w-3 text-green-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">AES-256 Bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <CheckCircle2 className="h-3 w-3 text-blue-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Verified by Antigravity</span>
                    </div>
                </div>
                <p className="text-[7px] text-gray-600 font-black uppercase tracking-[0.4em]">Integrated Secure Checkout Protocol v2.0</p>
            </div>
        </div>
    );
};

export default PaymentPage;
