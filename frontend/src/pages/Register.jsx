import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Users, Briefcase, Phone, MapPin } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Farm Hand today
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
          <div className="space-y-4 mb-8">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-center block">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${
                  role === 'farmer' 
                  ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100 scale-105' 
                  : 'bg-white border-gray-100 text-gray-400 grayscale'
                }`}
              >
                <User className="h-10 w-10 mb-2" />
                <span className="font-black text-xs uppercase tracking-widest">Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'labour' })}
                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${
                  role === 'labour' 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105' 
                  : 'bg-white border-gray-100 text-gray-400 grayscale'
                }`}
              >
                <Briefcase className="h-10 w-10 mb-2" />
                <span className="font-black text-xs uppercase tracking-widest">Worker</span>
              </button>
            </div>
            
            {role === 'labour' && (
              <div className="flex bg-gray-100 p-2 rounded-2xl mt-4">
                {['individual', 'group'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: type })}
                    className={`flex-1 py-4 text-sm font-black rounded-xl capitalize transition-all ${
                      (formData.accountType || 'individual') === type ? 'bg-white text-green-600 shadow-md' : 'text-gray-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-2xl relative block w-full pl-12 px-4 py-5 border-2 border-gray-100 placeholder-gray-400 text-gray-900 font-bold text-lg focus:outline-none focus:ring-green-500 shadow-sm"
                  placeholder={formData.accountType === 'group' ? "Group Name" : "Full Name"}
                  value={name}
                  onChange={onChange}
                />
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  className="appearance-none rounded-2xl relative block w-full pl-12 px-4 py-5 border-2 border-gray-100 placeholder-gray-400 text-gray-900 font-bold text-lg focus:outline-none focus:ring-green-500 shadow-sm"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={onChange}
                />
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-6 w-6 text-gray-400" />
                </div>
                <select
                  id="location"
                  name="location"
                  required
                  className="appearance-none rounded-2xl relative block w-full pl-12 px-4 py-5 border-2 border-gray-100 text-gray-900 font-bold text-lg focus:outline-none focus:ring-green-500 shadow-sm bg-white"
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

          <div>
            <button
              type="submit"
              className="group relative w-full h-16 flex justify-center items-center px-4 border border-transparent text-xl font-black uppercase tracking-widest rounded-[2rem] text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95"
            >
              Start Now
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
