import React, { useState, useEffect } from 'react';
import EnergyMindDashboard from './components/dashboard';
import BuildingView from './components/BuildingView';
import {
  ArrowRight,
  Building2,
  Leaf,
  Users,
  ShieldCheck,
  RefreshCw,
  LayoutDashboard,
  Bell,
  Lightbulb,
  BarChart3,
  FileText,
  Settings,
  X,
  Menu,
} from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const validateUserProfile = async (user) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, is_approved')
        .eq('id', user.id)
        .single();

      if (
        profileError ||
        !profile?.is_approved ||
        !['admin', 'staff'].includes(profile.role)
      ) {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setCurrentProfile(null);
        setFormMessage('Your account is awaiting university approval. Please contact your university administrator.');
        return false;
      }

      setCurrentUser(user);
      setCurrentProfile(profile);
      return true;
    } catch (err) {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setCurrentProfile(null);
      setFormMessage(err.message || 'Could not validate account authorization.');
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          await validateUserProfile(session.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    };

    const timer = setTimeout(() => {
      if (isMounted) setIsCheckingSession(false);
    }, 2000);

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentProfile(null);
        setOtpSent(false);
        setOtp('');
        setActiveNav('Dashboard');
      } else if (session?.user && !currentUser) {
        await validateUserProfile(session.user);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    setLoginSuccess(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setFormMessage(error.message || 'Could not send the verification code.');
        return;
      }

      setOtpSent(true);
      setOtp('');
    } catch (error) {
      setFormMessage(error.message || 'Could not send the verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setFormMessage('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setFormMessage(error.message || 'Could not resend the code. Please try again later.');
        return;
      }

      setOtp('');
      setSuccessMessage('A new verification code has been sent. Check your email.');
    } catch (error) {
      setFormMessage(error.message || 'Could not resend the verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      });

      if (error) {
        setFormMessage('The verification code is invalid or expired. Please try again or request a new code.');
        return;
      }

      if (!data.user) {
        setFormMessage('Could not verify your account. Please request a new code.');
        return;
      }

      const isValidated = await validateUserProfile(data.user);
      if (isValidated) {
        setLoginSuccess(true);
        setActiveNav('Dashboard');
      }
    } catch (error) {
      setFormMessage(error.message || 'Could not verify the code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentProfile(null);
    setOtpSent(false);
    setOtp('');
    setEmail('');
    setFormMessage('');
    setSuccessMessage('');
    setActiveNav('Dashboard');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isCheckingSession) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <p className="text-sm font-medium tracking-wide animate-pulse">
          Loading CampusTwin EnergyMind...
        </p>
      </div>
    );
  }

  // Authenticated Application Router
  if (currentUser && currentProfile) {
    const userName = currentProfile.full_name || currentUser.email || 'User';
    const userRole = currentProfile.role || 'staff';

    if (activeNav === 'Building') {
      return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Navigation Sidebar */}
          <aside
            className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1727] text-slate-300 flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out shrink-0 h-full ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <h1 className="text-white font-bold text-lg leading-tight">CampusTwin</h1>
                    <p className="text-blue-400 font-semibold text-sm">EnergyMind</p>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden text-slate-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="mt-6 space-y-1">
                  <button
                    onClick={() => {
                      setActiveNav('Dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Building');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm transition cursor-pointer"
                  >
                    <Building2 className="w-5 h-5" />
                    Building
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Alerts');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      Alerts
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      6
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Recommendations');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Recommendations
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Analytics');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Reports');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
                  >
                    <FileText className="w-5 h-5" />
                    Reports
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Users');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
                  >
                    <Users className="w-5 h-5" />
                    Users
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition cursor-pointer"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm shrink-0">
                    {getInitials(userName)}
                  </div>
                  <div className="truncate">
                    <p className="text-white text-sm font-semibold leading-tight truncate">
                      {userName}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {userRole === 'admin' ? 'Facility Administrator' : 'Staff Member'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Building Container */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <div className="lg:hidden p-4 bg-[#0B1727] text-white flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg bg-slate-800 text-slate-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-sm">Building View</span>
            </div>
            <BuildingView onNavigateToDashboard={() => setActiveNav('Dashboard')} />
          </main>
        </div>
      );
    }

    return (
      <EnergyMindDashboard
        userName={userName}
        userRole={userRole}
        userEmail={currentUser.email || ''}
        onSignOut={handleSignOut}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />
    );
  }

  // Unauthenticated Login Screen
  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row font-sans bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white overflow-hidden">
      <div className="relative w-full lg:w-7/12 h-auto lg:h-full bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/65" />
          <div className="absolute inset-0 bg-sky-950/30 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-12 sm:w-12 sm:h-14 border-2 border-white/90 flex flex-col items-center justify-center p-1 rounded-sm bg-slate-900/40 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div className="text-[6px] sm:text-[7px] font-black tracking-widest text-white uppercase mt-0.5">
                IILM
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-3xl font-serif tracking-wide text-white font-bold leading-tight drop-shadow-sm">
                IILM
              </h1>
              <p className="text-[9px] sm:text-[10px] tracking-[0.25em] font-sans font-semibold text-slate-200 uppercase">
                UNIVERSITY
              </p>
              <p className="text-[7px] sm:text-[8px] tracking-[0.2em] font-sans text-sky-200/90 uppercase">
                GREATER NOIDA
              </p>
            </div>
          </div>

          <div className="text-right font-serif italic text-xs sm:text-base text-slate-200/90 leading-snug">
            <p>People</p>
            <p>Purpose</p>
            <p className="underline decoration-sky-400/60 decoration-1 underline-offset-4">
              Progress
            </p>
          </div>
        </div>

        <div className="relative z-10 my-auto py-6 sm:py-8 max-w-xl">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 sm:mb-3 drop-shadow-md">
            CampusTwin
            <br />
            <span className="text-sky-300">EnergyMind</span>
          </h2>

          <p className="text-slate-200 text-xs sm:text-base font-normal leading-relaxed mb-6 sm:mb-8 max-w-lg">
            Digital Twin of a University Building for Occupancy-Aware Energy and
            Indoor Environmental Monitoring
          </p>

          <div className="space-y-3 sm:space-y-5">
            <div className="flex items-start space-x-3 sm:space-x-4 group">
              <div className="p-2 sm:p-3 rounded-full bg-teal-800/80 text-teal-200 ring-1 ring-teal-400/30 group-hover:bg-teal-700 transition-colors shadow-md shrink-0">
                <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-semibold text-white group-hover:text-sky-200 transition-colors">
                  Real-time occupancy insights
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-300">
                  Understand how your campus spaces are used
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 group">
              <div className="p-2 sm:p-3 rounded-full bg-emerald-800/80 text-emerald-200 ring-1 ring-emerald-400/30 group-hover:bg-emerald-700 transition-colors shadow-md shrink-0">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-semibold text-white group-hover:text-emerald-200 transition-colors">
                  Energy &amp; resource monitoring
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-300">
                  Promote sustainable and efficient operations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 group">
              <div className="p-2 sm:p-3 rounded-full bg-teal-800/80 text-teal-200 ring-1 ring-teal-400/30 group-hover:bg-teal-700 transition-colors shadow-md shrink-0">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-semibold text-white group-hover:text-sky-200 transition-colors">
                  Smarter and greener campus
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-300">
                  Data-driven decisions for a better tomorrow
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/10 text-[10px] sm:text-xs tracking-wider text-slate-300 uppercase space-y-0.5">
          <p className="font-semibold text-white">IILM UNIVERSITY, GREATER NOIDA</p>
          <p className="text-slate-400 font-medium">
            SCHOOL OF COMPUTER SCIENCE AND ENGINEERING
          </p>
        </div>
      </div>

      <div className="relative w-full lg:w-5/12 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-100/70 overflow-y-auto">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tl from-sky-200/50 via-sky-100/30 to-transparent pointer-events-none" />

        <nav className="flex justify-end space-x-6 sm:space-x-8 text-xs sm:text-sm font-medium text-slate-600 mb-6 sm:mb-8 z-10 shrink-0">
          <a href="#home" className="hover:text-slate-900 transition-colors">Home</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
        </nav>

        <div className="my-auto max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-slate-100 z-10">
          <div className="mb-6">
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {otpSent ? 'Verify your email' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {otpSent
                ? `Enter the 6-digit code sent to ${email.trim()}`
                : 'Sign in to CampusTwin EnergyMind'}
            </p>
          </div>

          {loginSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Sign in successful! Your account is verified.</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs sm:text-sm rounded-lg">
              {successMessage}
            </div>
          )}

          {formMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700"
            >
              {formMessage}
            </div>
          )}

          <form onSubmit={otpSent ? handleVerifyOtp : handleSubmit}>
            {!otpSent ? (
              <>
                <div className="mb-5">
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    University Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your university email"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  {!isLoading && <ArrowRight className="inline ml-2 h-4 w-4" />}
                </button>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <label htmlFor="otp" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter the 6-digit code sent to your email"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm tracking-widest outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono text-center text-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isResending || otp.length !== 6}
                  className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || isResending}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setFormMessage('');
                      setSuccessMessage('');
                    }}
                    disabled={isLoading || isResending}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
                  >
                    Back to email
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] sm:text-xs text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-600">Use University verified email</p>
            <p>IILM University, Greater Noida</p>
          </div>
        </div>

        <div className="mt-8 text-right z-10 shrink-0">
          <p className="font-serif italic text-slate-700 text-xs sm:text-base tracking-wide">
            “Sustainable Campuses for Brighter Tomorrows”
          </p>
          <div className="w-16 h-0.5 bg-slate-300 ml-auto mt-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}