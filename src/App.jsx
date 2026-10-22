import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  Building2, 
  Leaf, 
  Users,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login action
    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      
      {/* ========================================================= */}
      {/* LEFT PANEL: Campus Visuals, Branding, & Feature Highlights */}
      {/* ========================================================= */}
      {}
      <div className="relative lg:w-7/12 min-h-[550px] lg:min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden">
        
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')`,
          }}
        >
          {/* Subtle gradient overlay to match real photo depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/75 to-slate-900/60" />
          <div className="absolute inset-0 bg-sky-950/30 backdrop-blur-[1px]" />
        </div>

        {/* Top Header: Logo & Motto */}
        {}
        <div className="relative z-10 flex items-start justify-between gap-4">
          {/* University Logo Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-14 border-2 border-white/90 flex flex-col items-center justify-center p-1 rounded-sm bg-slate-900/40 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div className="text-[7px] font-black tracking-widest text-white uppercase mt-0.5">IILM</div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white font-bold leading-tight drop-shadow-sm">
                IILM
              </h1>
              <p className="text-[10px] tracking-[0.25em] font-sans font-semibold text-slate-200 uppercase">
                UNIVERSITY
              </p>
              <p className="text-[8px] tracking-[0.2em] font-sans text-sky-200/90 uppercase">
                GREATER NOIDA
              </p>
            </div>
          </div>

          {/* Slogan Top Right */}
          <div className="text-right font-serif italic text-sm sm:text-base text-slate-200/90 leading-snug">
            <p>People</p>
            <p>Purpose</p>
            <p className="underline decoration-sky-400/60 decoration-1 underline-offset-4">Progress</p>
          </div>
        </div>

        {/* Hero Section Content */}
        {}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 drop-shadow-md">
            CampusTwin<br />
            <span className="text-sky-300">EnergyMind</span>
          </h2>
          <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed mb-8 max-w-lg text-shadow-sm">
            Digital Twin of a University Building for Occupancy-Aware Energy and Indoor Environmental Monitoring
          </p>

          {/* Feature List */}
          <div className="space-y-4 sm:space-y-5">
            {/* Feature 1 */}
            <div className="flex items-start space-x-4 group">
              <div className="p-3 rounded-full bg-teal-800/80 text-teal-200 ring-1 ring-teal-400/30 group-hover:bg-teal-700 transition-colors shadow-md shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-sky-200 transition-colors">
                  Real-time occupancy insights
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Understand how your campus spaces are used
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-4 group">
              <div className="p-3 rounded-full bg-emerald-800/80 text-emerald-200 ring-1 ring-emerald-400/30 group-hover:bg-emerald-700 transition-colors shadow-md shrink-0">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-emerald-200 transition-colors">
                  Energy & resource monitoring
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Promote sustainable and efficient operations
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-4 group">
              <div className="p-3 rounded-full bg-teal-800/80 text-teal-200 ring-1 ring-teal-400/30 group-hover:bg-teal-700 transition-colors shadow-md shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-sky-200 transition-colors">
                  Smarter and greener campus
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Data-driven decisions for a better tomorrow
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Panel Footer */}
        {}
        <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] sm:text-xs tracking-wider text-slate-300 uppercase space-y-0.5">
          <p className="font-semibold text-white">IILM UNIVERSITY, GREATER NOIDA</p>
          <p className="text-slate-400 font-medium">SCHOOL OF COMPUTER SCIENCE AND ENGINEERING</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Navbar, Authentication Form, & Footer Quote  */}
      {/* ========================================================= */}
      {}
      <div className="relative lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-100/70 overflow-hidden">
        
        {/* Decorative background curve effect on bottom-right */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tl from-sky-200/50 via-sky-100/30 to-transparent pointer-events-none" />

        {/* Top Navigation Links */}
        {}
        <nav className="flex justify-end space-x-8 text-sm font-medium text-slate-600 mb-8 z-10">
          <a href="#home" className="hover:text-slate-900 transition-colors">Home</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
        </nav>

        {/* Main Login Card */}
        {}
        <div className="my-auto max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-slate-100 z-10">
          
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to CampusTwin EnergyMind
            </p>
          </div>
          {loginSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Sign in successful! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / User ID Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email / User ID
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@iilm.edu.in"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 transition cursor-pointer"
                />
                <span className="ml-2 text-slate-600 group-hover:text-slate-800 text-xs sm:text-sm">
                  Remember me
                </span>
              </label>
              <a 
                href="#forgot-password" 
                className="text-xs sm:text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Primary Sign In Button */}
            {}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#123e5d] hover:bg-[#0e324c] active:bg-[#0a263b] text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group disabled:opacity-70"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              {!isLoading && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* University SSO Button */}
            <button
              type="button"
              className="w-full py-2.5 px-4 bg-white border-2 border-[#1d62b4] text-[#1d62b4] hover:bg-sky-50/50 active:bg-sky-100/50 font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Sign in with University SSO</span>
            </button>
          </form>

          {/* Card Sub-footer Info */}
          {}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-600">B.Tech Major Project 2026–27</p>
            <p>School of Computer Science and Engineering</p>
            <p>IILM University, Greater Noida</p>
          </div>
        </div>

        {/* Bottom Right Slogan Quote */}
        {}
        <div className="mt-8 text-right z-10">
          <p className="font-serif italic text-slate-700 text-sm sm:text-base tracking-wide">
            “Sustainable Campuses for Brighter Tomorrows”
          </p>
          <div className="w-16 h-0.5 bg-slate-300 ml-auto mt-1 rounded-full" />
        </div>

      </div>
    </div>
  );
}