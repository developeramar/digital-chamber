import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Scale, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (user: any, isDemo: boolean) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        await signup(email, password, fullName.trim());
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'An error occurred. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password Authentication is not enabled in your Firebase console. Please go to Firebase Console > Authentication > Sign-in method, enable "Email/Password", or click "Access Interactive Demo Mode" below to proceed with local sandbox database!';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    // Enable Sandbox mode for testing the Digital Chamber without sign-in limits
    const mockUser = {
      uid: 'demo_lawyer_123',
      email: 'demo@digitalchamber.law',
      displayName: 'Adv. Amar Kumar Chaudhari',
      barCouncilNumber: 'BC/1234/2026',
      chamberAddress: 'Chamber No. 42, District Court Compound'
    };
    onLoginSuccess(mockUser, true);
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-8 z-10"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl mb-4 shadow-inner">
            <Scale className="h-8 w-8" id="scale-icon" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2 font-sans">
            Digital Chamber
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Replace your paper diary with a highly secure and smart digital companion.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl mb-6 text-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Advocate Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </motion.div>
          )}

          {isSignUp && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Bar Council Number (Optional)</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. MAH/2485/2026"
                  value={barNumber}
                  onChange={(e) => setBarNumber(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="advocate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : isSignUp ? (
              'Create Law Chamber'
            ) : (
              'Enter Law Chamber'
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-700/60"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-widest font-medium">Or Use Sandbox</span>
          <div className="flex-grow border-t border-slate-700/60"></div>
        </div>

        <button
          onClick={handleDemoMode}
          type="button"
          className="w-full bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-medium py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Access Interactive Demo Mode
        </button>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            {isSignUp ? 'Already have a chamber? Log In' : "Don't have a chamber? Create accounts for free"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
