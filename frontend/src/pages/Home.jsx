import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart2, Shield, Zap, Globe, MessageSquare } from 'lucide-react';
import BrandTicker from '../BrandTicker';

const Home = () => {
  const navigate = useNavigate();

  // Capture token from URL after Google Redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    
    if (token) {
      console.log("Token detected in URL, saving to local storage...");
      localStorage.setItem('token', token);
      
      // Clean up URL and force navigate
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
            <BarChart2 className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">BRAND AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-blue-400 transition-colors">Platform</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Solutions</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Insights</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Company</a>
        </div>

        <button 
          onClick={() => navigate('/chat')}
          className="px-6 py-2.5 bg-white text-slate-950 rounded-full font-bold text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-24 pb-12 text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-12 animate-bounce">
          <Zap size={14} />
          <span>v2.0 Artificial Intelligence is here</span>
        </div>

        {/* Clean Google Login Section */}
        <div className="flex flex-col items-center justify-center gap-4 mb-20 z-20 relative">
          <button 
            onClick={() => {
              const apiBase = window.location.hostname === 'localhost' 
                ? 'http://localhost:8000' 
                : `https://${window.location.hostname.replace('-5173', '-8000')}`;
              window.location.href = `${apiBase}/auth/login`;
            }}
            className="group px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-100 transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:shadow-white/20 active:scale-95 border border-transparent"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            Continue with Google
            <ArrowRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-slate-500 text-sm">Sign in to securely access the AI Chatbot</p>
        </div>

        {/* Brand Ticker now sits beautifully isolated in the dark theme */}
        <BrandTicker />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-16 bg-black/20 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-blue-500" size={20} />
            <span className="text-xl font-bold text-white tracking-tighter">BRAND AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Brand AI Analytics. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
