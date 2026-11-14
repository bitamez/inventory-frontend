import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import companyLogo from '../../assets/company-logo.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState(null); // 'loading', 'success', 'error'

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotStatus('loading');
    setTimeout(() => setForgotStatus('success'), 1500);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotStatus(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 p-1 border shadow-lg rounded-2xl border-border bg-surface">
              <img src={companyLogo} alt="Company Logo" className="object-contain w-full h-full rounded-xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-textMain">Welcome back</h1>
          <p className="mt-1 text-sm text-textMuted">Sign in to your Inventory &amp; Sales account</p>
        </div>

        {/* Login Card */}
        <div className="p-8 border shadow-2xl bg-surface border-border rounded-2xl">

          {/* Error Message */}
          {error && (
            <div className="flex items-start p-4 mb-6 space-x-3 text-sm border bg-danger/10 border-danger/20 rounded-xl text-danger">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-textMain" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 text-sm transition-colors border bg-background border-border rounded-xl text-textMain placeholder-textMuted focus:outline-none focus:border-primary"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-textMain" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs transition-colors text-primary hover:text-primary/80"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 text-sm transition-colors border bg-background border-border rounded-xl text-textMain placeholder-textMuted focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute transition-colors -translate-y-1/2 right-4 top-1/2 text-textMuted hover:text-textMain"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 mt-2 space-x-2 font-semibold text-white transition-all duration-200 bg-primary hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-xs text-center text-textMuted">
          &copy; 2026 Inventory &amp; Sales Management System. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-textMain/20 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 overflow-hidden border shadow-2xl bg-surface border-border rounded-2xl">
            <h2 className="mb-2 text-xl font-bold text-textMain">Reset Password</h2>

            {forgotStatus === 'success' ? (
              <div className="space-y-4">
                <div className="p-4 text-sm border bg-primary/10 border-primary/20 text-primary rounded-xl">
                  If an account exists for <strong>{forgotEmail}</strong>, you will receive a password reset link shortly.
                  <br /><br />
                  If you don't receive an email, please contact your System Administrator.
                </div>
                <button
                  onClick={closeForgotModal}
                  className="w-full px-4 py-2.5 mt-2 font-medium text-textMain border border-border bg-background hover:bg-surfaceHighlight rounded-xl transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="mb-4 text-sm text-textMuted">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textMain">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 text-sm transition-colors border bg-background border-border rounded-xl text-textMain placeholder-textMuted focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="flex-1 px-4 py-2.5 font-medium text-textMain border border-border rounded-xl hover:bg-surfaceHighlight transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotStatus === 'loading' || !forgotEmail}
                    className="flex-1 px-4 py-2.5 font-medium text-white bg-primary rounded-xl hover:bg-primaryHover transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    {forgotStatus === 'loading' ? (
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
