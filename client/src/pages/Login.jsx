import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import AuthPageNav from '../components/shared/AuthPageNav';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(formData.email, formData.password, { rememberMe });
    if (success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-200 p-4 sm:p-8 items-center justify-center">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl h-[600px]">
        <AuthPageNav />
        
        {/* Left Side - Image */}
        <div className="hidden w-1/2 md:block relative">
          <img 
            src="/img/animals/bear.jpg" 
            alt="Lahore Zoo" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Overlay to give the image a slightly better contrast if needed */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full md:w-1/2 flex-col justify-center px-8 sm:px-16 relative">
          
          <div className="mx-auto w-full max-w-sm">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <img src="/img/logo.png" alt="Zoo Logo" className="mx-auto h-16 w-16 mb-4 rounded-xl shadow-sm" />
              <h2 className="text-2xl font-bold text-gray-800">Sign in</h2>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600 font-medium">Remember me</span>
                </label>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors flex justify-center items-center"
              >
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Sign in'}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 text-center text-xs font-semibold text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800">
                Sign Up!
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
