'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle, Cloud } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const supabaseConfigured = isSupabaseConfigured();

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpDisplayName, setSignUpDisplayName] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Shared state
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cloud only mode
  const selectedMode = 'supabase' as const;

  const resetForm = () => {
    setSignInEmail('');
    setSignInPassword('');
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpDisplayName('');
    setSignUpConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!signInEmail.trim() || !signInPassword) {
      setError('Please enter your email and password.');
      setIsLoading(false);
      return;
    }

    const { error: authError } = await signIn(signInEmail.trim(), signInPassword, selectedMode);
    if (authError) {
      setError(authError);
    } else {
      handleClose();
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!signUpEmail.trim() || !signUpPassword || !signUpConfirmPassword) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const result = await signUp(signUpEmail.trim(), signUpPassword, signUpDisplayName.trim() || undefined, selectedMode);
    if (result.error) {
      setError(result.error);
    } else {
      if (result.autoSignedIn) {
        handleClose();
      } else if (result.needsEmailConfirmation) {
        setSuccessMessage('Account created! Email confirmation may be required. If you don\'t receive an email within a few minutes, try signing in directly.');
        setActiveTab('signin');
        setSignInEmail(signUpEmail.trim());
      } else {
        handleClose();
      }
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            margin: 0,
            padding: '1rem',
            overflow: 'auto',
          }}
          className="bg-slate-900/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          />
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ position: 'relative', zIndex: 100000, maxWidth: '28rem', width: '100%' }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-[#0f172a] px-6 py-5">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/pharma-icon.png"
                    alt="PharmaInsight"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">PharmaInsight</h2>
                  <p className="text-xs text-white/60 font-medium">Sign in to save reports & bookmarks</p>
                </div>
              </div>
            </div>

            {/* Cloud Auth Info */}
            <div className="px-6 pt-5 pb-0">
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/70 rounded-xl border border-blue-100">
                <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Cloud size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700">Cloud Authentication</p>
                  <p className="text-[10px] text-blue-500 leading-tight">Supabase Auth — syncs across devices</p>
                </div>
              </div>
              {!supabaseConfigured && (
                <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-tight">
                    Cloud auth not configured. Contact admin to set up Supabase credentials.
                  </p>
                </div>
              )}
            </div>

            {/* Tabs & Forms */}
            <div className="p-6 pt-4">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(null); setSuccessMessage(null); }}>
                <TabsList className="w-full mb-5">
                  <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In Form */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-gray-700 text-xs font-semibold">Email</Label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className="pl-10 h-10"
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-gray-700 text-xs font-semibold">Password</Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="pl-10 h-10"
                          autoComplete="current-password"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {successMessage && (
                      <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <AlertCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-emerald-700">{successMessage}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || !supabaseConfigured}
                      className="w-full h-10 font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Cloud size={15} className="mr-1.5" />
                          Sign In (Cloud)
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-displayname" className="text-gray-700 text-xs font-semibold">Display Name <span className="text-gray-400">(optional)</span></Label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="signup-displayname"
                          type="text"
                          placeholder="Dr. Jane Smith"
                          value={signUpDisplayName}
                          onChange={(e) => setSignUpDisplayName(e.target.value)}
                          className="pl-10 h-10"
                          autoComplete="name"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700 text-xs font-semibold">Email</Label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="pl-10 h-10"
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-700 text-xs font-semibold">Password</Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Min. 6 characters"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="pl-10 h-10"
                          autoComplete="new-password"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-gray-700 text-xs font-semibold">Confirm Password</Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Repeat your password"
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          className="pl-10 h-10"
                          autoComplete="new-password"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || !supabaseConfigured}
                      className="w-full h-10 font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <Cloud size={15} className="mr-1.5" />
                          Create Account (Cloud)
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <p className="text-[11px] text-gray-400 text-center mt-5 leading-relaxed">
                By signing in, you agree to our terms of service.<br />
                Search is always public. Auth is only required for saving reports.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
