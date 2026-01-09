import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Users, Briefcase, Phone, MapPin, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'farmer', // Default role
    mobile: '',
    location: '',
    accountType: 'individual',
    groupMembersCount: 1
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, role, mobile, location } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect based on role
        if (data.user.role === 'farmer') {
            navigate('/dashboard');
        } else {
            navigate('/labour/dashboard');
        }
      } else {
        setError(data.msg || 'Registration failed');
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

      <div className="max-w-md w-full flex flex-col h-[85vh] md:h-[90vh] bg-white rounded-3xl md:rounded-[3.5rem] shadow-2xl shadow-gray-200/50 relative z-10 border border-white overflow-hidden">
        {/* Fixed Header Section */}
        <div className="text-center p-8 md:p-12 pb-2 md:pb-4 flex-shrink-0 bg-white">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-green-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl shadow-green-200">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 uppercase mb-2 md:mb-3">
            Create Account
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
            Quickly create your account to start
          </p>
          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">
              {error}
            </div>
          )}
        </div>

        {/* Scrollable Form Section */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-8 md:pb-12 custom-scrollbar">
          <form className="space-y-8" onSubmit={onSubmit}>
            <div className="space-y-6">
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'farmer' })}
                      className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 transition-all ${
                        role === 'farmer' 
                        ? 'bg-green-600 border-green-600 text-white shadow-2xl shadow-green-100 scale-105' 
                        : 'bg-white border-gray-100 text-gray-400 grayscale hover:border-green-200'
                      }`}
                    >
                      <User className="h-8 w-8 md:h-10 md:w-10 mb-2" />
                      <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">Farmer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'labour' })}
                      className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 transition-all ${
                        role === 'labour' 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-100 scale-105' 
                        : 'bg-white border-gray-100 text-gray-400 grayscale hover:border-blue-200'
                      }`}
                    >
                      <Briefcase className="h-8 w-8 md:h-10 md:w-10 mb-2" />
                      <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">Worker</span>
                    </button>
                  </div>
                  
                  {/* Account type toggle removed to simplify registration */}
              </div>

              <div className="space-y-3 md:space-y-4">
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 md:pl-6 flex items-center pointer-events-none">
                        <User className="h-5 w-5 md:h-6 md:w-6 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="appearance-none rounded-2xl md:rounded-[2rem] relative block w-full pl-14 md:pl-16 px-5 md:px-6 py-4 md:py-6 border-2 border-gray-100 placeholder-gray-300 text-gray-900 font-bold text-lg md:text-xl focus:outline-none focus:border-green-500 transition-all shadow-xl shadow-gray-100/50"
                        placeholder={formData.accountType === 'group' ? "Group Name" : "Full Name"}
                        value={name}
                        onChange={onChange}
                      />
                  </div>

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

                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 md:pl-6 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 md:h-6 md:w-6 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                      </div>
                      <select
                        id="location"
                        name="location"
                        required
                        className="appearance-none rounded-2xl md:rounded-[2rem] relative block w-full pl-14 md:pl-16 px-5 md:px-6 py-4 md:py-6 border-2 border-gray-100 text-gray-900 font-bold text-lg md:text-xl focus:outline-none focus:border-green-500 transition-all shadow-xl shadow-gray-100/50 bg-white"
                        value={location}
                        onChange={onChange}
                      >
                          <option value="" disabled>Where do you live?</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                      </select>
                  </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-16 md:h-20 flex justify-center items-center px-6 md:px-8 border border-transparent text-lg md:text-xl font-black uppercase tracking-widest rounded-2xl md:rounded-[2rem] text-white bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-100 transition-all active:scale-95 py-5 md:py-6"
            >
              Create Account <ArrowRight className="ml-3 md:ml-4 h-5 w-5 md:h-6 md:w-6" />
            </button>
            <div className="text-center pt-6 border-t border-gray-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="ml-1 text-green-600 hover:text-green-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
