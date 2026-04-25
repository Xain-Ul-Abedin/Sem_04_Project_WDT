import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import AuthPageNav from '../components/shared/AuthPageNav';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);
    const success = await forgotPassword(email);
    if (success) {
      setStep(2);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    const success = await resetPassword(email, otp, password);
    if (success) {
      navigate('/login');
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
            src="/img/animals/jaguar.jpg" 
            alt="Lahore Zoo" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full md:w-1/2 flex-col justify-center px-8 sm:px-16 relative">
          
          <div className="mx-auto w-full max-w-sm">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <img src="/img/logo.png" alt="Zoo Logo" className="mx-auto h-16 w-16 mb-4 rounded-xl shadow-sm" />
              <h2 className="text-2xl font-bold text-gray-800">
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                {step === 1 
                  ? "Enter your email to receive an OTP." 
                  : "Enter the OTP sent to your email and your new password."}
              </p>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {formError}
              </div>
            )}

            {/* Step 1: Request OTP Form */}
            {step === 1 && (
              <form className="space-y-4" onSubmit={handleRequestOtp}>
                <div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="E-mail Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors flex justify-center items-center mt-2"
                >
                  {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Send OTP'}
                </button>
              </form>
            )}

            {/* Step 2: Reset Password Form */}
            {step === 2 && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength={4}
                    inputMode="numeric"
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-center tracking-widest font-mono text-lg"
                    placeholder="0 0 0 0"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="New Password *"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Confirm New Password *"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors flex justify-center items-center mt-2"
                >
                  {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="mt-8 text-center text-xs font-semibold text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Sign In
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
