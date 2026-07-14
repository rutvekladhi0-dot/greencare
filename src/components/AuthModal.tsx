import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle, signUpWithEmail, loginWithEmail } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'admin'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const profile = await loginWithEmail(email, password);
        setSuccessMsg("Logged in successfully!");
        setTimeout(() => {
          onSuccess(profile);
          onClose();
        }, 1000);
      } else {
        if (!name.trim()) {
          throw new Error("Name is required");
        }
        const profile = await signUpWithEmail(email, password, name, role);
        setSuccessMsg(`Registered successfully as ${role}!`);
        setTimeout(() => {
          onSuccess(profile);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = "An unexpected error occurred.";
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = "Authentication method (Email/Password) is disabled. Please verify you are in the Firebase Console for Project ID 'halogen-verve-xxhgq', go to Authentication -> Sign-in method, edit 'Email/Password', make sure the 'Email/Password' toggle is Enabled (and not just Email Link), and click Save.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = "This email is already in use.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "Password should be at least 6 characters.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const profile = await signInWithGoogle();
      setSuccessMsg("Logged in with Google successfully!");
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please allow popups or use the Email Login form instead.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Google Sign-In is currently disabled. Please verify you are in the Firebase Console for Project ID 'halogen-verve-xxhgq', go to Authentication -> Sign-in method, click 'Add new provider', select 'Google', configure it, and click Save.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-slideUp"
        id="auth-modal-card"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          id="close-auth-modal-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header decoration */}
        <div className="bg-emerald-600 text-white p-6 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight">GreenCare Portal</h2>
          <p className="text-emerald-100 text-xs mt-1 font-semibold tracking-wide uppercase">
            Your Comprehensive Medical Companion
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`w-1/2 py-4 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
            id="auth-tab-login"
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`w-1/2 py-4 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
            id="auth-tab-register"
          >
            Create Account
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl flex items-start space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl flex items-start space-x-2 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Login (OAuth API Integration) */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2.5 border border-slate-200 hover:bg-slate-50 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            id="google-signin-btn"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.66 1.45 7.55l3.77 2.92C6.12 7.02 8.84 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.9c2.18-2.01 3.7-4.98 3.7-8.64z"
              />
              <path
                fill="#FBBC05"
                d="M5.22 14.71a7.12 7.12 0 0 1-.37-2.27c0-.79.13-1.56.37-2.27L1.45 7.25a11.96 11.96 0 0 0 0 9.5l3.77-2.92z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.9c-1.12.75-2.55 1.2-4.23 1.2-3.16 0-5.88-1.98-6.78-4.93l-3.77 2.92C3.4 20.34 7.37 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-slate-150"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Or email login</span>
            <div className="flex-grow border-t border-slate-150"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    id="auth-input-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  id="auth-input-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  id="auth-input-password"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                      role === 'patient'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Admin (Test)
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-md shadow-emerald-100 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="auth-submit-btn"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          {/* Test Account Helper text */}
          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-[11px] text-slate-500 space-y-1">
            <span className="font-bold flex items-center gap-1 text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              Testing Tip:
            </span>
            <p>
              You can create an **Admin** profile above to test full dashboard capabilities, or sign in with any email starting with <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">admin</code> to automatically get admin permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
