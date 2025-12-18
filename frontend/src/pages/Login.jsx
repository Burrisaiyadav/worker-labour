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
            // Redirect based on role (defaulting to dashboard for all for now)
            navigate('/dashboard'); 
        } else {
            setError(data.msg || 'Invalid OTP');
        }
    } catch (err) {
        setError('Server Error');
        console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
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
             <form className="mt-8 space-y-6" onSubmit={onSendOtp}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div className="mb-4">
                    <label htmlFor="mobile" className="sr-only">
                        Mobile Number
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        required
                        className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={onChange}
                        />
                    </div>
                    </div>
                </div>

                <div>
                    <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                    Send OTP
                    </button>
                </div>
            </form>
        ) : (
            <form className="mt-8 space-y-6" onSubmit={onVerifyOtp}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div className="mb-4">
                    <label htmlFor="otp" className="sr-only">
                        OTP
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={onChange}
                        />
                    </div>
                    </div>
                </div>

                <div className="flex gap-4">
                     <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="group relative flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                    Back
                    </button>
                    <button
                        type="submit"
                        className="group relative flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                    Login
                    </button>
                </div>
            </form>
        )}
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
