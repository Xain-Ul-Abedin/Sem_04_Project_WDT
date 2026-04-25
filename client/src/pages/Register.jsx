import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import AuthPageNav from '../components/shared/AuthPageNav';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password Validation Criteria
  const validatePassword = (pass) => {
    return {
      length: pass.length >= 8,
      lowercase: /[a-z]/.test(pass),
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };
  };

  const getStrengthScore = (criteria) => {
    return Object.values(criteria).filter(Boolean).length;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const score = getStrengthScore(validatePassword(formData.password));
    if (score < 5) {
      setError('Please choose a stronger password matching all criteria.');
      return;
    }

    setIsLoading(true);
    const registerData = { ...formData };
    delete registerData.confirmPassword;
    const success = await register(registerData);
    
    if (success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-200 p-4 sm:p-8 items-center justify-center">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl min-h-[600px]">
        <AuthPageNav />
        
        {/* Left Side - Image */}
        <div className="hidden w-1/2 md:block relative">
          <img 
            src="/img/animals/animal-08.jpg" 
            alt="Lahore Zoo Entrance" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full md:w-1/2 flex-col justify-center px-8 sm:px-16 py-8 relative overflow-y-auto">
          
          <div className="mx-auto w-full max-w-sm">
            {/* Logo and Title */}
            <div className="text-center mb-6">
              <img src="/img/logo.png" alt="Zoo Logo" className="mx-auto h-16 w-16 mb-4 rounded-xl shadow-sm" />
              <h2 className="text-2xl font-bold text-gray-800">Sign up</h2>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {error && (
                <div className="text-center text-xs font-semibold text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="E-mail Address *"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((index) => {
                      const score = getStrengthScore(validatePassword(formData.password));
                      const getBgColor = () => {
                        if (score < 3) return 'bg-red-400';
                        if (score < 5) return 'bg-yellow-400';
                        return 'bg-green-500';
                      };
                      return (
                        <div key={index} className={`flex-1 rounded-full ${index <= score ? getBgColor() : 'bg-gray-200'}`} />
                      );
                    })}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-1 mt-2 text-xs">
                    {Object.entries({
                      'Min 8 characters': validatePassword(formData.password).length,
                      'Lowercase letter': validatePassword(formData.password).lowercase,
                      'Uppercase letter': validatePassword(formData.password).uppercase,
                      'Number': validatePassword(formData.password).number,
                      'Special character': validatePassword(formData.password).special
                    }).map(([label, isValid]) => (
                      <div key={label} className={`flex items-center gap-1 ${isValid ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                        {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 mt-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors flex justify-center items-center"
              >
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Sign up'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-xs font-semibold text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Sign in!
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
