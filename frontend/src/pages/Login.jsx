import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [formData, setFormData] = useState({
    mobile: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [serverOtp, setServerOtp] = useState(''); // For demo purposes to show OTP in UI if returned
  const navigate = useNavigate();

  const { mobile, otp } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSendOtp = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/api/auth/login/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile }),
        });
        const data = await response.json();
        
        if (response.ok) {
            setStep(2);
            setError('');
            if (data.otp) {
                // For demo/dev purposes, show the OTP or log it
                console.log('Received OTP:', data.otp);
                setServerOtp(data.otp); 
            }
        } else {
            setError(data.msg || 'Failed to send OTP');
        }
    } catch (err) {
        setError('Server Error');
        console.error(err);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/api/auth/login/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, otp }),
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.user.role === 'labour' || data.user.role === 'worker' || data.user.role === 'laborer') {
                navigate('/labour/dashboard');
            } else {
                navigate('/dashboard'); 
            } 
        } else {
            setError(data.msg || 'Invalid OTP');
        }
    } catch (err) {
        setError('Server Error');
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12 font-sans overflow-hidden relative">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-md w-full space-y-6 md:space-y-10 bg-white p-8 md:p-12 rounded-3xl md:rounded-[3.5rem] shadow-2xl shadow-gray-200/50 relative z-10 border border-white">
        <div className="text-center">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-green-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl shadow-green-200">
                <Lock className="h-10 w-10 text-white" />
            </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-3 md:mb-4 italic">
            Welcome back
          </h2>
          <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
            {step === 1 ? 'Enter your mobile number to sign in' : 'Enter the OTP sent to your mobile'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Demo Timer/OTP Hint */}
        {step === 2 && serverOtp && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm text-center mb-4">
                <strong>Demo:</strong> Your OTP is {serverOtp}
            </div>
        )}

        {step === 1 ? (
             <form className="space-y-6 md:space-y-8" onSubmit={onSendOtp}>
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 md:pl-6 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 md:h-6 md:w-6 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        </div>
                        <input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            required
                            className="appearance-none rounded-2xl md:rounded-[2rem] relative block w-full pl-14 md:pl-16 px-5 md:px-6 py-4 md:py-6 border-2 border-gray-100 placeholder-gray-300 text-gray-900 font-bold text-lg md:text-xl focus:outline-none focus:border-green-500 transition-all shadow-xl shadow-gray-100/50"
                            placeholder="Mobile Number"
                            value={mobile}
                            onChange={onChange}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full h-16 md:h-20 flex justify-center items-center px-6 md:px-8 border border-transparent text-lg md:text-xl font-black uppercase tracking-widest rounded-2xl md:rounded-[2rem] text-white bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-100 transition-all active:scale-95 py-5 md:py-6"
                >
                    Send OTP <ArrowRight className="ml-3 md:ml-4 h-5 w-5 md:h-6 md:w-6" />
                </button>
            </form>
        ) : (
            <form className="space-y-6 md:space-y-8" onSubmit={onVerifyOtp}>
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 md:pl-6 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 md:h-6 md:w-6 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        </div>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            className="appearance-none rounded-2xl md:rounded-[2rem] relative block w-full pl-14 md:pl-16 px-5 md:px-6 py-4 md:py-6 border-2 border-gray-100 placeholder-gray-300 text-gray-900 font-bold text-lg md:text-xl focus:outline-none focus:border-green-500 transition-all shadow-xl shadow-gray-100/50"
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={onChange}
                        />
                    </div>
                </div>

                <div className="flex gap-3 md:gap-4">
                     <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center bg-gray-50 text-gray-500 rounded-xl md:rounded-2xl hover:bg-gray-100 transition-all flex-shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                        type="submit"
                        className="flex-1 h-14 md:h-16 flex justify-center items-center px-6 md:px-8 text-base md:text-lg font-black uppercase tracking-widest rounded-xl md:rounded-2xl text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95"
                    >
                        Verify & Login
                    </button>
                </div>
            </form>
        )}
        
        <div className="text-center mt-10 pt-6 border-t border-gray-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="ml-1 text-green-600 hover:text-green-700 transition-colors">
              Create One
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
