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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>;

    if (!job) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 font-bold">Job Not Found</div>;

    if (paymentStep === 'success') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 scale-110 animate-bounce">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Payment Successful</h1>
                <p className="text-gray-500 font-bold mb-8">₹{job.cost.toLocaleString()} paid to {job.group || 'Labour Group'}</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-sm mb-8 text-left space-y-3 border border-gray-100">
                    <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                        <span>Transaction ID</span>
                        <span className="text-gray-900">PAY-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                        <span>Date & Time</span>
                        <span className="text-gray-900">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                        <span>Status</span>
                        <span className="text-green-600">Completed</span>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full max-w-sm py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all active:scale-95"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1c24] text-white font-sans flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Secure Checkout</span>
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-black text-xs">
                    RZ
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-lg mx-auto w-full p-6 space-y-8">
                {/* Order Summary */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Order amount</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-400">₹</span>
                        <span className="text-5xl font-black tracking-tighter">{job.cost.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400">Payment for {job.title}</span>
                        <span className="text-green-400">#{jobId.slice(-6).toUpperCase()}</span>
                    </div>
                </div>

                {paymentStep === 'processing' ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative h-24 w-24">
                            <div className="absolute inset-0 rounded-full border-4 border-green-500/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-black tracking-tight mb-2">Processing Payment</h2>
                            <p className="text-sm text-gray-400 font-bold">Please do not refresh the page</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Payment Method</h2>
                        
                        <div className="space-y-3">
                            {/* UPI */}
                            <button 
                                onClick={() => setSelectedMethod('upi')}
                                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedMethod === 'upi' ? 'bg-green-600/20 border-green-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${selectedMethod === 'upi' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">UPI (Google Pay, PhonePe)</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fast & Secure</p>
                                    </div>
                                </div>
                                {selectedMethod === 'upi' && <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>}
                            </button>

                            {/* Card */}
                            <button 
                                onClick={() => setSelectedMethod('card')}
                                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedMethod === 'card' ? 'bg-green-600/20 border-green-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${selectedMethod === 'card' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Debit / Credit Card</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Visa, Mastercard, RuPay</p>
                                    </div>
                                </div>
                                {selectedMethod === 'card' && <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>}
                            </button>

                            {/* NetBanking */}
                            <button 
                                onClick={() => setSelectedMethod('netbanking')}
                                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedMethod === 'netbanking' ? 'bg-green-600/20 border-green-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${selectedMethod === 'netbanking' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Netbanking</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">All major Indian banks</p>
                                    </div>
                                </div>
                                {selectedMethod === 'netbanking' && <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>}
                            </button>
                        </div>

                        <button 
                            onClick={handlePayment}
                            className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-green-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 translate-y-4"
                        >
                            Pay ₹{job.cost.toLocaleString()} <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-8 text-center bg-black/20 mt-auto">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">100% Encrypted & Safe</span>
                </div>
                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Powered by Antigravity Checkout Service</p>
            </div>
        </div>
    );
};

export default PaymentPage;
