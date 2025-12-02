import React, { useState, useEffect } from 'react';
import { Shield, Users, Ticket, ArrowRight, Lock, Loader2, ChevronRight, X } from 'lucide-react';
import { UserRole } from '../types';

interface SplashScreenProps {
  onComplete: (role: UserRole) => void;
  teamLogo?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, teamLogo = '' }) => {
  // 0: Init, 1: Logo Reveal, 2: Text Reveal, 3: Buttons Reveal, 4: Auth Mode
  const [animationStep, setAnimationStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Loading Screen State
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [finalRole, setFinalRole] = useState<UserRole>('guest');

  useEffect(() => {
    setImgError(false);
  }, [teamLogo]);

  useEffect(() => {
    // Cinematic Sequence
    const timers = [
      setTimeout(() => setAnimationStep(1), 500),  // Logo Pop
      setTimeout(() => setAnimationStep(2), 1500), // Title Fade In
      setTimeout(() => setAnimationStep(3), 2200), // Buttons Slide Up
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Typing Effect for Loading Screen
  useEffect(() => {
    if (isAppLoading) {
      const fullText = "The Legacy of some Crackheads...";
      let currentIndex = 0;
      
      // Initial delay before typing starts
      const startDelay = setTimeout(() => {
        const interval = setInterval(() => {
          if (currentIndex <= fullText.length) {
            setLoadingText(fullText.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(interval);
            // Wait a moment after typing finishes before entering app
            setTimeout(() => {
              onComplete(finalRole);
            }, 1000);
          }
        }, 100); // Typing speed
        return () => clearInterval(interval);
      }, 500);

      return () => clearTimeout(startDelay);
    }
  }, [isAppLoading, finalRole, onComplete]);

  const initiateAppEntry = (role: UserRole) => {
    setFinalRole(role);
    setIsAppLoading(true);
  };

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'guest') {
      initiateAppEntry('guest');
    } else {
      setSelectedRole(role);
      setError('');
      setPassword('');
      setAnimationStep(4);
    }
  };

  const handleCloseAuth = () => {
    setAnimationStep(3);
    setSelectedRole(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    // Simulate API verification
    setTimeout(() => {
      setIsAuthenticating(false);
      
      // Demo Credentials
      if (selectedRole === 'admin' && password === 'admin123') {
        initiateAppEntry('admin');
      } else if (selectedRole === 'member' && password === 'member123') {
        initiateAppEntry('member');
      } else {
        setError(`Incorrect password for ${selectedRole}.`);
      }
    }, 1000);
  };

  if (isAppLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-sans overflow-hidden">
        {/* Simple Background for Loading */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black"></div>
        
        <div className="relative z-10 text-center px-4">
           {/* Pulsing Logo */}
           <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center animate-pulse">
                {teamLogo && !imgError ? (
                  <img src={teamLogo} alt="Logo" className="w-full h-full object-contain opacity-50 grayscale" onError={() => setImgError(true)} />
                ) : (
                  <Shield size={60} className="text-slate-700" />
                )}
              </div>
           </div>

           {/* Typing Text */}
           <h2 className="text-3xl md:text-5xl text-slate-300 font-cursive tracking-wide min-h-[60px]" style={{ fontFamily: '"Dancing Script", cursive' }}>
              {loadingText}
              <span className="animate-blink">|</span>
           </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black opacity-90"></div>
        {/* Animated Stadium Lights Effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '30px 30px' }}>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center h-full">
        
        {/* LOGO SECTION - Flex Col ensures strict horizontal centering */}
        <div className={`
          transform transition-all duration-1000 ease-out flex flex-col items-center justify-center w-full
          ${animationStep >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}
          ${animationStep >= 3 ? '-translate-y-12 md:-translate-y-20' : ''} 
        `}>
          <div className="relative flex justify-center mb-6 w-full">
            {/* Logo Crest / Placeholder - Added mx-auto for extra safety */}
            <div className={`
                mx-auto w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:scale-105 transition-transform duration-500 animate-zoom-in
                ${teamLogo && !imgError ? 'bg-transparent' : 'bg-gradient-to-br from-blue-600 to-blue-800'}
            `}>
              {teamLogo && !imgError ? (
                <img 
                  src={teamLogo} 
                  alt="Indian Strikers Logo" 
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Shield size={80} className="text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className={`text-center w-full transform transition-all duration-1000 delay-300 ${animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase drop-shadow-2xl mb-2 text-center mx-auto">
              Indian <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Strikers</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-lg uppercase tracking-[0.3em] font-medium text-center">
              Official Team Management Portal
            </p>
          </div>
        </div>

        {/* LOGIN BUTTONS SECTION */}
        <div className={`
          w-full max-w-4xl grid md:grid-cols-3 gap-4 md:gap-6 mt-8
          transform transition-all duration-700 ease-out delay-100
          ${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}
        `}>
          {/* Admin Button */}
          <button 
            onClick={() => handleRoleSelect('admin')}
            className="group relative bg-slate-800/60 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={64} className="text-blue-500 rotate-12" />
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Team Admin</h3>
            <p className="text-xs text-slate-400 mb-4">Full management access</p>
            <div className="flex items-center text-xs font-bold text-blue-400 uppercase tracking-wider group-hover:text-white transition-colors">
              Login Required <ChevronRight size={14} className="ml-1" />
            </div>
          </button>

          {/* Member Button */}
          <button 
            onClick={() => handleRoleSelect('member')}
            className="group relative bg-slate-800/60 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500 rounded-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={64} className="text-emerald-500 rotate-12" />
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Club Member</h3>
            <p className="text-xs text-slate-400 mb-4">Player & Staff access</p>
            <div className="flex items-center text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:text-white transition-colors">
              Login Required <ChevronRight size={14} className="ml-1" />
            </div>
          </button>

          {/* Guest Button */}
          <button 
            onClick={() => handleRoleSelect('guest')}
            className="group relative bg-slate-800/60 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 hover:border-orange-500 rounded-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10 text-left overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Ticket size={64} className="text-orange-500 rotate-12" />
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Ticket size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Guest Fan</h3>
            <p className="text-xs text-slate-400 mb-4">View-only access</p>
            <div className="flex items-center text-xs font-bold text-orange-400 uppercase tracking-wider group-hover:text-white transition-colors">
              Enter App <ChevronRight size={14} className="ml-1" />
            </div>
          </button>
        </div>
      </div>

      {/* AUTH MODAL OVERLAY */}
      {animationStep === 4 && selectedRole && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden relative transform transition-all scale-100 opacity-100">
            {/* Close Button */}
            <button 
              onClick={handleCloseAuth}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                  {selectedRole === 'admin' ? <Shield className="text-white" size={24} /> : <Users className="text-white" size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white capitalize">{selectedRole} Login</h3>
                  <p className="text-sm text-slate-400">Enter your secure password</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-colors placeholder:text-slate-600"
                    />
                  </div>
                  {error && (
                    <div className="mt-2 text-red-400 text-xs flex items-center gap-1 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                      {error}
                    </div>
                  )}
                  <p className="text-slate-600 text-[10px] mt-2 ml-1">
                    Hint: Use <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-400 font-mono">{selectedRole}123</code>
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={!password || isAuthenticating}
                  className={`
                    w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4
                    ${selectedRole === 'admin' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                    }
                    ${(!password || isAuthenticating) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
                  `}
                >
                  {isAuthenticating ? <Loader2 size={18} className="animate-spin" /> : 'Authenticate'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;