import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart2, Shield, Zap, Globe, MessageSquare } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Capture token from URL after Google Redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    
    if (token) {
      localStorage.setItem('token', token);
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
      console.log("Token successfully captured and saved.");
      // Automatically redirect to chat
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
      <main className="relative z-10 px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-12 animate-bounce">
          <Zap size={14} />
          <span>v2.0 Artificial Intelligence is here</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/chat')}
            className="group px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all flex items-center gap-2 shadow-2xl shadow-blue-600/30"
          >
            Launch AI Assistant
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
            View Documentation
          </button>
        </div>

        {/* Feature Grid */}
        <section className="mt-40 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Globe className="text-blue-400" />,
              title: "Global Dataset",
              desc: "Deep analysis across the comprehensive Combined DJI News archives."
            },
            {
              icon: <Zap className="text-yellow-400" />,
              title: "Instant Retrieval",
              desc: "Millisecond response times using advanced Vector Search architecture."
            },
            {
              icon: <Shield className="text-emerald-400" />,
              title: "Sentiment Scoring",
              desc: "Algorithmic classification of market-moving headlines and trends."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* Floating Chat Preview Card */}
        <div className="mt-40 relative max-w-5xl mx-auto p-4 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-blue-600/5 pointer-events-none"></div>
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold tracking-widest text-slate-500">
              SECURE ANALYTICS TERMINAL
            </div>
          </div>
          
          <div className="space-y-6 px-8 pb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <MessageSquare className="text-white" size={20} />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-6 py-4 text-left max-w-[80%]">
                <p className="text-slate-300 text-sm">Analyze the headlines for July 2nd, 2016. What was the general sentiment?</p>
              </div>
            </div>
            <div className="flex items-start gap-4 flex-row-reverse">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Zap className="text-white" size={20} />
              </div>
              <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl rounded-tr-none px-6 py-4 text-left max-w-[80%]">
                <p className="text-slate-200 text-sm">Based on the records, the sentiment was cautiously bullish. Multiple headlines pointed towards international market stabilization...</p>
              </div>
            </div>
          </div>
        </div>
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
