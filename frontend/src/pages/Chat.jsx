import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, LogOut, Send, Bot, UserRound, Loader2, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

const Chat = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (e) {
        console.error("Failed to parse JWT", e);
      }
    }
  }, [token]);

  // Chat States
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Brand Analyst. Ask me anything about brand performance, market share, and industry trends.' }
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch suggestions as the user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      const words = input.trim().split(/\s+/);
      if (words.length >= 3) {
        try {
          const response = await axios.post(`${API_BASE}/suggestions`, 
            { text: input },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSuggestions(response.data.suggestions || []);
        } catch (err) {
          console.error("Suggestions error:", err);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input, token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

  const handleSendMessage = async (e, messageOverride = null) => {
    if (e) e.preventDefault();
    
    const messageText = messageOverride || input;
    if (!messageText.trim()) return;

    const userMessage = messageText.trim();
    if (!messageOverride) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/query`, 
        { 
          query: userMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { answer } = response.data;

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: answer
      }]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl text-center">
            <h2 className="text-3xl font-black text-white mb-4">Verification Required</h2>
            <p className="text-slate-400 mb-8">Please sign in to access the AI Analytics Terminal.</p>
            <button
                onClick={() => window.location.href = `${API_BASE}/auth/login`}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
            >
                Continue with Google
            </button>
            <button onClick={() => navigate('/')} className="mt-6 text-slate-500 text-sm hover:text-slate-300">
                Back to Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="z-50 flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Bot size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">AI ANALYST</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner uppercase">
                {user.name ? user.name.charAt(0) : <User size={14} />}
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-[13px] font-bold text-white leading-tight">
                  {user.name || "User"}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {user.sub || "Authenticated"}
                </span>
              </div>
            </div>
          )}
          <button onClick={logout} title="Logout" className="p-2 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 rounded-xl transition-all text-slate-400 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto space-y-8 px-4 pb-32 pt-8 scrollbar-hide">
          {messages.map((msg, idx) => {
            const safeContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            return (
            <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-slate-800' : 'bg-blue-600'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Zap size={20} />}
              </div>
              <div className={`max-w-[80%] px-6 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-blue-600/80 text-white rounded-tr-none border border-blue-400/20' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md'}`}>
                <p className="text-sm leading-relaxed">{safeContent}</p>
              </div>
            </div>
          )})}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl rounded-tl-none backdrop-blur-md italic text-slate-500 text-sm">
                Scanning brand dataset...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {suggestions.length > 0 && (
          <div className="absolute bottom-24 left-0 right-0 px-4 flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            {suggestions.map((s, i) => {
              if (typeof s !== 'string') return null;
              return (
              <button
                key={i}
                onClick={() => {
                  const currentInput = input.trim().toLowerCase();
                  const suggestion = s.toLowerCase();
                  if (suggestion.startsWith(currentInput)) {
                    setInput(s);
                  } else {
                    setInput(prev => `${prev.trim()} ${s}`.trim());
                  }
                  setSuggestions([]);
                }}
                className="bg-white/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-blue-500/20 transition-colors backdrop-blur-md"
              >
                {s}
              </button>
            )})}
          </div>
        )}

        {/* Input */}
        <div className="absolute bottom-8 left-4 right-4 max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="bg-white/5 border border-white/10 p-2 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query brand data or market share..."
              className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-200 placeholder:text-slate-500 text-sm font-light"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-500 transition-all disabled:opacity-50 disabled:scale-95 active:scale-95 shadow-xl shadow-blue-600/20"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
